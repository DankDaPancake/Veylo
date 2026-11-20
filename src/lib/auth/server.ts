import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { getPrisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "./password.mjs";

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!secret || !baseURL) throw new Error("Better Auth environment configuration is required");
  return betterAuth({
    secret,
    baseURL,
    database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      password: {
        hash: hashPassword,
        verify: ({ password, hash }) => verifyPassword(password, hash),
      },
    },
    session: { expiresIn: 8 * 60 * 60, disableSessionRefresh: true },
  });
}

let auth: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  return (auth ??= createAuth());
}
