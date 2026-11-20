import { jsonBody, withOrderAccess } from "@/lib/orders/http";
import { cancelOrder } from "@/lib/orders/service";

export function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withOrderAccess(request, async (hubId) => Response.json(await cancelOrder(hubId, (await context.params).id, await jsonBody(request))));
}
