/**
 * prisma/seed.ts
 * Seeds 15 actors with correct image numbering
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // Remove existing actors
  await prisma.actor.deleteMany();

  const actors = Array.from({ length: 15 }).map((_, i) => {

    const n = i + 1;

    return {
      id: crypto.randomUUID(),
      name: `Actor ${n}`,
      role: "Actor",
      bio: "This is a professional actor biography that appears on the actor profile page.",
      imageUrl: `/images/actor${n}.jpg`,   // FIXED HERE
      number: n
    };

  });

  await prisma.actor.createMany({
    data: actors
  });

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