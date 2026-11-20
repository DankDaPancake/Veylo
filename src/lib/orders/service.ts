import "server-only";
import { getPrisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { OrderError, editableFields, hasNul, localInput, objectBody, parseListQuery, rejectUnknown, requireVersion, validateOrder } from "./validation";
import { parseOrdersCsv } from "./csv";

function duplicate(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function createOrder(hubId: string, body: unknown) {
  const data = validateOrder(body);
  try { return await getPrisma().order.create({ data: { ...data, hubId } }); }
  catch (error) {
    if (duplicate(error)) throw new OrderError(409, "DUPLICATE_ORDER_CODE", [{ field: "order_code", message: `Code ${data.order_code} already exists in this hub` }]);
    throw error;
  }
}

export async function listOrders(hubId: string, params: URLSearchParams) {
  const query = parseListQuery(params);
  const literal = query.q.replace(/[\\%_]/g, "\\$&");
  const where: Prisma.OrderWhereInput = {
    hubId, status: query.status,
    window_start: { gte: query.from, lt: query.until },
    ...(literal ? { OR: ["order_code", "recipient_name", "recipient_phone"].map((field) => ({ [field]: { contains: literal, mode: "insensitive" } })) } : {}),
  };
  return getPrisma().$transaction(async (tx) => {
    const total = await tx.order.count({ where });
    const page = query.page > Math.max(1, Math.ceil(total / 20)) ? 1 : query.page;
    const orders = await tx.order.findMany({ where, orderBy: [{ window_start: "asc" }, { order_code: "asc" }], skip: (page - 1) * 20, take: 20 });
    return { orders, total, page, pageSize: 20 };
  }, { isolationLevel: "RepeatableRead" });
}

function rejectNulId(id: string) {
  if (hasNul(id)) throw new OrderError(404, "NOT_FOUND");
}

export async function getOrder(hubId: string, id: string) {
  rejectNulId(id);
  const order = await getPrisma().order.findFirst({ where: { id, hubId } });
  if (!order) throw new OrderError(404, "NOT_FOUND");
  return order;
}

export async function editOrder(hubId: string, id: string, value: unknown) {
  const body = objectBody(value);
  rejectUnknown(body, [...editableFields, "version"]);
  const { version: rawVersion, ...changes } = body;
  const version = requireVersion(rawVersion);
  rejectNulId(id);
  return getPrisma().$transaction(async (tx) => {
    const saved = await tx.order.findFirst({ where: { id, hubId } });
    if (!saved) throw new OrderError(404, "NOT_FOUND");
    const current = Object.fromEntries(editableFields.map((field) => [field, saved[field as keyof typeof saved]]));
    const data = validateOrder({ ...current, order_code: saved.order_code, weight_kg: saved.weight_kg.toString(), window_start: localInput(saved.window_start), window_end: localInput(saved.window_end), ...changes });
    const result = await tx.order.updateMany({
      where: { id, hubId, version, status: "NEW" },
      data: { ...data, version: { increment: 1 } },
    });
    if (result.count !== 1) throw new OrderError(409, "ORDER_CONFLICT");
    return tx.order.findFirstOrThrow({ where: { id, hubId } });
  });
}

export async function cancelOrder(hubId: string, id: string, value: unknown) {
  const body = objectBody(value);
  rejectUnknown(body, ["reason", "version"]);
  const version = requireVersion(body.version);
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (hasNul(reason) || [...reason].length < 5 || [...reason].length > 300) throw new OrderError(400, "VALIDATION_ERROR", [{ field: "reason", message: "Use 5–300 characters without NUL" }]);
  rejectNulId(id);
  return getPrisma().$transaction(async (tx) => {
    if (!await tx.order.findFirst({ where: { id, hubId }, select: { id: true } })) throw new OrderError(404, "NOT_FOUND");
    const result = await tx.order.updateMany({ where: { id, hubId, version, status: "NEW" }, data: { status: "CANCELLED", cancellation_reason: reason, version: { increment: 1 } } });
    if (result.count !== 1) throw new OrderError(409, "ORDER_CONFLICT");
    return tx.order.findFirstOrThrow({ where: { id, hubId } });
  });
}

export async function importOrders(hubId: string, bytes: Uint8Array, filename: string) {
  const rows = parseOrdersCsv(bytes, filename);
  const where = { hubId, normalized_code: { in: rows.map(({ data }) => data.normalized_code) } };
  const conflicts = async () => {
    const saved = await getPrisma().order.findMany({ where, select: { normalized_code: true } });
    const codes = new Set(saved.map((order) => order.normalized_code));
    return rows.filter(({ data }) => codes.has(data.normalized_code)).map(({ row, data }) => ({ row, field: "order_code", message: `Code ${data.order_code} already exists in this hub` }));
  };
  const errors = await conflicts();
  if (errors.length) throw new OrderError(409, "DUPLICATE_ORDER_CODE", errors);
  try {
    await getPrisma().$transaction(async (tx) => {
      await tx.order.createMany({ data: rows.map(({ data }) => ({ ...data, hubId })) });
    });
  } catch (error) {
    if (duplicate(error)) throw new OrderError(409, "DUPLICATE_ORDER_CODE", await conflicts());
    throw error;
  }
  return { imported: rows.length };
}
