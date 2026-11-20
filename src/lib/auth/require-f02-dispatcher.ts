import "server-only";
import { getAuth } from "./server";
import { getPrisma } from "@/lib/db";

export type F02Access =
  | { ok: true; userId: string; hubId: string }
  | { ok: false; status: 401; code: "UNAUTHENTICATED" }
  | { ok: false; status: 403; code: "FORBIDDEN" };

export async function requireF02Dispatcher(headers: Headers): Promise<F02Access> {
  const session = await getAuth().api.getSession({ headers });
  if (!session) return { ok: false, status: 401, code: "UNAUTHENTICATED" };

  const user = await getPrisma().user.findUnique({
    where: { id: session.user.id },
    select: { role: true, hubId: true },
  });
  if (!user || user.role !== "DISPATCHER" || !user.hubId) {
    return { ok: false, status: 403, code: "FORBIDDEN" };
  }
  return { ok: true, userId: session.user.id, hubId: user.hubId };
}
