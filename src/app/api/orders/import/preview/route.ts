import { withOrderAccess } from "@/lib/orders/http";
import { previewOrdersCsv } from "@/lib/orders/service";
import { OrderError } from "@/lib/orders/validation";

export function POST(request: Request) {
  return withOrderAccess(request, async (hubId) => {
    let form: FormData;
    try { form = await request.formData(); }
    catch { throw new OrderError(400, "INVALID_CSV", [{ field: "file", message: "Supply a multipart file" }]); }
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 1_000_000) throw new OrderError(400, "INVALID_CSV", [{ field: "file", message: "Supply a CSV file of at most 1,000,000 bytes" }]);
    return Response.json(await previewOrdersCsv(hubId, new Uint8Array(await file.arrayBuffer()), file.name));
  });
}
