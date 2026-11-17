export function GET() {
  return Response.json({ status: 'ok', service: 'veylo', scope: 'application' });
}
