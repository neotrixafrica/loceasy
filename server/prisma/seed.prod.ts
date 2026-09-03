import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function seed() {
  console.log('Production seed: No test data created.');
  console.log('This seed script is intentionally empty for production.');
  console.log('Database is ready for real user data.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
