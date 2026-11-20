import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { requireF02Dispatcher } from "@/lib/auth/require-f02-dispatcher";
import { OrdersWorkspace } from "./workspace";

export default async function OrdersPage() {
  const access = await requireF02Dispatcher(await headers());
  if (!access.ok) {
    if (access.status === 401) redirect("/sign-in?next=/orders");
    forbidden();
  }

  return <OrdersWorkspace />;
}
