import type { PrismaClient } from "../generated/prisma/client";
import { hashPassword } from "../lib/auth/password.mjs";
import { validateDatabaseUrl } from "../scripts/validate-db-url.mjs";

export const demoHubKeys = { hubA: "hub-a", hubB: "hub-b" } as const;

export function assertDemoDatabaseUrl(databaseUrl: string) {
  const url = new URL(validateDatabaseUrl(databaseUrl));
  if (
    process.env.NODE_ENV === "production" ||
    process.env.VEYLO_ENABLE_DEMO_SEED !== "1" ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.pathname !== "/veylo_demo"
  ) {
    throw new Error("Demo seed requires explicit opt-in and the disposable local veylo_demo database");
  }
}

export async function seedDemoAccounts(
  prisma: PrismaClient,
  hubs: { hubAId: string; hubBId: string },
  databaseUrl: string,
) {
  assertDemoDatabaseUrl(databaseUrl);
  const { hubAId, hubBId } = hubs;
  if (!hubAId || !hubBId || hubAId === hubBId) throw new Error("Two distinct demo hub IDs are required");

  const fixtures = [
    { name: "Demo Admin", email: "admin@example.test", role: "ADMIN", hubId: null },
    { name: "Demo Dispatcher A", email: "dispatcher-a@example.test", role: "DISPATCHER", hubId: hubAId },
    { name: "Demo Dispatcher B", email: "dispatcher-b@example.test", role: "DISPATCHER", hubId: hubBId },
    { name: "Demo Rider", email: "rider@example.test", role: "RIDER", hubId: null },
  ] as const;
  const passwords: string[] = [];
  for (let index = 0; index < fixtures.length; index += 1) {
    passwords.push(await hashPassword("Veylo-PA3-demo-only!"));
  }
  await prisma.$transaction(async (tx) => {
    const [database] = await tx.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`;
    if (database?.name !== "veylo_demo") throw new Error("Connected database is not veylo_demo");
    if (await tx.hub.count({ where: { id: { in: [hubAId, hubBId] } } }) !== 2) {
      throw new Error("Initialize both demo hubs before seeding accounts");
    }
    for (const [index, fixture] of fixtures.entries()) {
      const existing = await tx.user.findUnique({
        where: { email: fixture.email },
        include: { accounts: true },
      });
      if (existing) {
        if (
          existing.name !== fixture.name || existing.role !== fixture.role || existing.hubId !== fixture.hubId ||
          !existing.accounts.some((account) =>
            account.providerId === "credential" && account.accountId === existing.id && account.password
          )
        ) {
          throw new Error("A demo login conflicts with an existing account");
        }
        continue;
      }
      const user = await tx.user.create({ data: fixture });
      await tx.account.create({
        data: { providerId: "credential", accountId: user.id, userId: user.id, password: passwords[index] },
      });
    }
  });
}
