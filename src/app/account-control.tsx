"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAuthClient } from "better-auth/react";

const auth = createAuthClient();

export function AccountControl() {
  const router = useRouter();
  const { data, isPending } = auth.useSession();
  const [error, setError] = useState(false);
  if (isPending) return null;
  if (!data) return <Link href="/sign-in">Sign in</Link>;

  async function signOut() {
    setError(false);
    try {
      const result = await auth.signOut();
      if (result.error) {
        setError(true);
        return;
      }
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setError(true);
    }
  }

  return (
    <div>
      <button type="button" onClick={signOut}>Sign out</button>
      {error && <p role="alert">Sign-out failed. Please try again.</p>}
    </div>
  );
}
