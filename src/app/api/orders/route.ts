import { jsonBody, withOrderAccess } from "@/lib/orders/http";
import { createOrder, listOrders } from "@/lib/orders/service";

export function GET(request: Request) {
  return withOrderAccess(request, async (hubId) => Response.json(await listOrders(hubId, new URL(request.url).searchParams)));
}

export function POST(request: Request) {
  return withOrderAccess(request, async (hubId) => Response.json(await createOrder(hubId, await jsonBody(request)), { status: 201 }));
}
