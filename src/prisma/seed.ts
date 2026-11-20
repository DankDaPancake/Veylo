import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";
import { assertDemoDatabaseUrl, demoHubKeys, seedDemoAccounts } from "./seed-demo-accounts.ts";

const databaseUrl = process.env.DATABASE_URL ?? "";
assertDemoDatabaseUrl(databaseUrl);
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
try {
  const hubs = await prisma.$transaction(async (tx) => {
    const [database] = await tx.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`;
    if (database?.name !== "veylo_demo") throw new Error("Connected database is not veylo_demo");
    const hubA = await tx.hub.upsert({ where: { code: demoHubKeys.hubA }, update: {}, create: { code: demoHubKeys.hubA, name: "Synthetic Hub A" } });
    const hubB = await tx.hub.upsert({ where: { code: demoHubKeys.hubB }, update: {}, create: { code: demoHubKeys.hubB, name: "Synthetic Hub B" } });
    return { hubAId: hubA.id, hubBId: hubB.id };
  });
  await seedDemoAccounts(prisma, hubs, databaseUrl);
  await prisma.order.createMany({
    skipDuplicates: true,
    data: Object.values(hubs).flatMap((hubId) => Array.from({ length: 25 }, (_, i) => ({
      hubId,
      order_code: `DEMO-${String(i + 1).padStart(3, "0")}`,
      normalized_code: `demo-${String(i + 1).padStart(3, "0")}`,
      recipient_name: `Synthetic Recipient ${i + 1}`,
      recipient_phone: `090000${String(i + 1).padStart(4, "0")}`,
      delivery_address: `${i + 1} Synthetic Demo Street`,
      window_start: new Date(`2026-11-${20 + i % 3}T02:00:00Z`),
      window_end: new Date(`2026-11-${20 + i % 3}T04:00:00Z`),
      weight_kg: "1.5",
    }))),
  });
  console.log("Synthetic fixtures ready: two hubs, four demo accounts, 50 orders; existing rows preserved.");
} finally {
  await prisma.$disconnect();
}
