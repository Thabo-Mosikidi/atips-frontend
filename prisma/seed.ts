/**
 * prisma/seed.ts
 * Purpose: Seed 15 actors into Supabase via Prisma.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing rows so reseeding is consistent
  await prisma.actor.deleteMany();

  // Create 15 actors
  const actors = Array.from({ length: 15 }).map((_, i) => {
    const n = i + 1;
    return {
      id: crypto.randomUUID(), // text id in your schema
      name: `Actor ${n}`,
      bio: "Professional actor bio.",
      imageUrl: `/images/actor${i}.jpg`,
      // Keep email nullable if your schema allows null; otherwise provide unique
      email: `actor${n}@atips.dev`,
      createdAt: new Date(),
    };
  });

  await prisma.actor.createMany({ data: actors });

  console.log("✅ Seeded 15 actors successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });