"use client";

import { useState, type FormEvent } from "react";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";

const auth = createAuthClient();

export default function SignInPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const result = await auth.signIn.email({
        email: String(form.get("email")).trim().toLowerCase(),
        password: String(form.get("password")),
      });
      if (result.error) {
        setError("Sign-in failed. Check your credentials and try again.");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next === "/orders" ? next : "/");
      router.refresh();
    } catch {
      setError("Sign-in is temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Sign in to Veylo</h1>
      <form onSubmit={signIn} className="mt-5 grid gap-4">
        <label>Email <input className="block w-full rounded border p-2" name="email" type="email" autoComplete="username" required /></label>
        <label>Password <input className="block w-full rounded border p-2" name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p role="alert">{error}</p>}
        <button className="rounded border p-2" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
