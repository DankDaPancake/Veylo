import { withOrderAccess } from "@/lib/orders/http";
import { csvTemplate } from "@/lib/orders/csv";

export function GET(request: Request) {
  return withOrderAccess(request, async () => new Response(csvTemplate, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="orders-template.csv"' } }));
}
