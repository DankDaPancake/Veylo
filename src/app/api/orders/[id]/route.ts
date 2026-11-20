import { jsonBody, withOrderAccess } from "@/lib/orders/http";
import { editOrder, getOrder } from "@/lib/orders/service";

type Context = { params: Promise<{ id: string }> };

export function GET(request: Request, context: Context) {
  return withOrderAccess(request, async (hubId) => Response.json(await getOrder(hubId, (await context.params).id)));
}

export function PATCH(request: Request, context: Context) {
  return withOrderAccess(request, async (hubId) => Response.json(await editOrder(hubId, (await context.params).id, await jsonBody(request))));
}
