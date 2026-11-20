import Link from "next/link";
import { AccountControl } from "./account-control";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 sm:px-12">
      <header className="flex items-center justify-between border-b border-emerald-900/20 pb-6">
        <span className="text-2xl font-semibold tracking-tight">Veylo</span>
        <Link href="/orders">Orders</Link>
        <AccountControl />
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-900">Local foundation</span>
      </header>
      <section className="max-w-2xl py-20 sm:py-28" aria-labelledby="welcome">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-800">Group 09 / BOOYAH-12</p>
        <h1 id="welcome" className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">A starting point for better deliveries.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">The Veylo application is running. Order management, staff access and delivery workflows will be added through their approved specifications.</p>
        <a className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-emerald-800 px-5 py-3 font-medium text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800" href="/api/health">View application health <span aria-hidden="true" className="ml-3">→</span></a>
        <p className="mt-4 text-sm leading-6 text-slate-600">Application health does not verify the database. Run the documented database check separately.</p>
      </section>
      <footer className="mt-auto border-t border-emerald-900/20 pt-5 text-sm text-slate-600">Development foundation · No delivery data is collected here.</footer>
    </main>
  );
}
