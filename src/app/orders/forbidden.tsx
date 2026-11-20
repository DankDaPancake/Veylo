import Link from "next/link";
import { AccountControl } from "../account-control";

export default function OrdersForbidden() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p>Orders are available to dispatchers with an assigned hub.</p>
      <Link href="/">Back to home</Link>
      <AccountControl />
    </main>
  );
}
