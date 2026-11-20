export type FieldError = { field: string; message: string; row?: number };

export class OrderError extends Error {
  status: number;
  code: string;
  errors: FieldError[];
  constructor(status: number, code: string, errors: FieldError[] = []) {
    super(code);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export const requiredFields = ["order_code", "recipient_name", "recipient_phone", "delivery_address", "window_start", "window_end", "weight_kg"] as const;
export const optionalFields = ["priority", "note", "latitude", "longitude"] as const;
export const editableFields: readonly string[] = [...requiredFields.filter((key) => key !== "order_code"), ...optionalFields];

export function objectBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new OrderError(400, "VALIDATION_ERROR", [{ field: "body", message: "Expected an object" }]);
  return value as Record<string, unknown>;
}

export function rejectUnknown(body: Record<string, unknown>, allowed: readonly string[]) {
  const errors = Object.keys(body).filter((key) => !allowed.includes(key)).map((field) => ({ field, message: "Field is not permitted" }));
  if (errors.length) throw new OrderError(400, "VALIDATION_ERROR", errors);
}

const POSTGRES_INT4_MAX = 2_147_483_647;

export function localInput(date: Date): string {
  return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ");
}

function isRepresentableUtc(date: Date): boolean {
  const utcYear = date.getUTCFullYear();
  return Number.isFinite(date.getTime()) && utcYear >= 1 && utcYear <= 9999;
}

function parseLocalText(text: string): Date | null {
  const date = new Date(text.replace(" ", "T") + ":00+07:00");
  return Number.isFinite(date.getTime()) && localInput(date) === text ? date : null;
}

export function parseLocalDateTime(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value.trim())) return null;
  const date = parseLocalText(value.trim());
  return date && isRepresentableUtc(date) ? date : null;
}

export function hasNul(value: string): boolean {
  return value.includes("\u0000");
}

function numeric(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function validateOrder(value: unknown) {
  const body = objectBody(value);
  rejectUnknown(body, [...requiredFields, ...optionalFields]);
  const errors: FieldError[] = [];
  const text = (field: string) => typeof body[field] === "string" ? body[field].trim() : "";
  const check = (valid: boolean, field: string, message: string) => { if (!valid) errors.push({ field, message }); };
  const order_code = text("order_code");
  const recipient_name = text("recipient_name");
  const recipient_phone = text("recipient_phone");
  const delivery_address = text("delivery_address");
  check(/^[A-Za-z0-9_-]{1,40}$/.test(order_code), "order_code", "Use 1–40 ASCII letters, digits, underscores or hyphens");
  check(!hasNul(recipient_name) && [...recipient_name].length >= 1 && [...recipient_name].length <= 100, "recipient_name", "Use 1–100 characters without NUL");
  check(/^0\d{9}$/.test(recipient_phone), "recipient_phone", "Use 10 digits starting with 0");
  check(!hasNul(delivery_address) && [...delivery_address].length >= 5 && [...delivery_address].length <= 255, "delivery_address", "Use 5–255 characters without NUL");
  const window_start = parseLocalDateTime(body.window_start);
  const window_end = parseLocalDateTime(body.window_end);
  check(window_start !== null, "window_start", "Use a valid YYYY-MM-DD HH:mm in Asia/Ho_Chi_Minh");
  check(window_end !== null, "window_end", "Use a valid YYYY-MM-DD HH:mm in Asia/Ho_Chi_Minh");
  if (window_start && window_end) check(window_end > window_start, "window_end", "End must be after start");
  const weight = numeric(body.weight_kg);
  check(weight !== null && weight > 0, "weight_kg", "Weight must be finite and positive");
  const suppliedPriority = typeof body.priority === "string" ? body.priority.trim() : body.priority;
  const priority = suppliedPriority === undefined || suppliedPriority === "" ? "NORMAL" : suppliedPriority;
  check(priority === "NORMAL" || priority === "HIGH", "priority", "Use NORMAL or HIGH");
  check(body.note === undefined || body.note === null || (typeof body.note === "string" && !hasNul(body.note)), "note", "Note must be text without NUL");
  const absent = (value: unknown) => value === undefined || value === null || (typeof value === "string" && value.trim() === "");
  const latitude = absent(body.latitude) ? null : numeric(body.latitude);
  const longitude = absent(body.longitude) ? null : numeric(body.longitude);
  if (!absent(body.latitude) || !absent(body.longitude)) {
    check(!absent(body.latitude) && latitude !== null && latitude >= -90 && latitude <= 90, "latitude", "Supply paired coordinates within latitude range [-90, 90]");
    check(!absent(body.longitude) && longitude !== null && longitude >= -180 && longitude <= 180, "longitude", "Supply paired coordinates within longitude range [-180, 180]");
  }
  if (errors.length) throw new OrderError(400, "VALIDATION_ERROR", errors);
  return {
    order_code, normalized_code: order_code.toLowerCase(), recipient_name, recipient_phone, delivery_address,
    window_start: window_start!, window_end: window_end!, weight_kg: String(body.weight_kg).trim(),
    priority: priority as "NORMAL" | "HIGH", note: typeof body.note === "string" ? body.note.trim() : null,
    latitude, longitude,
  };
}

export function requireVersion(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1 || value > POSTGRES_INT4_MAX) throw new OrderError(400, "VALIDATION_ERROR", [{ field: "version", message: "Supply a positive integer version" }]);
  return value;
}

export function parseListQuery(params: URLSearchParams) {
  const errors: FieldError[] = [];
  const status = params.get("status") || undefined;
  if (status && status !== "NEW" && status !== "CANCELLED") errors.push({ field: "status", message: "Use NEW or CANCELLED" });
  const dateBound = (field: "from" | "to", offsetMs: number) => {
    const value = params.get(field);
    if (!value) return undefined;
    const midnight = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseLocalText(value + " 00:00") : null;
    const bound = midnight ? new Date(midnight.getTime() + offsetMs) : null;
    if (!bound || !isRepresentableUtc(bound)) {
      errors.push({ field, message: "Use a valid YYYY-MM-DD" });
      return undefined;
    }
    return bound;
  };
  const from = dateBound("from", 0);
  const until = dateBound("to", 86400000);
  if (from && until && from >= until) errors.push({ field: "to", message: "End date must not precede start date" });
  const rawPage = params.get("page") ?? "1";
  const page = Number(rawPage);
  if (!/^\d+$/.test(rawPage) || !Number.isSafeInteger(page) || page < 1) errors.push({ field: "page", message: "Use a positive integer page" });
  const q = (params.get("q") ?? "").trim();
  if (hasNul(q)) errors.push({ field: "q", message: "Keyword must not contain NUL" });
  if (errors.length) throw new OrderError(400, "VALIDATION_ERROR", errors);
  return { status: status as "NEW" | "CANCELLED" | undefined, q, from, until, page };
}
