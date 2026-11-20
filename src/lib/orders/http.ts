import "server-only";
import { requireF02Dispatcher } from "@/lib/auth/require-f02-dispatcher";
import { OrderError } from "./validation";

export async function jsonBody(request: Request): Promise<unknown> {
  try { return await request.json(); }
  catch { throw new OrderError(400, "INVALID_JSON", [{ field: "body", message: "Supply valid JSON" }]); }
}

export async function withOrderAccess(request: Request, action: (hubId: string) => Promise<Response>) {
  try {
    const access = await requireF02Dispatcher(request.headers);
    if (!access.ok) return Response.json({ code: access.code }, { status: access.status });
    return await action(access.hubId);
  } catch (error) {
    if (error instanceof OrderError) return Response.json({ code: error.code, errors: error.errors }, { status: error.status });
    return Response.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
