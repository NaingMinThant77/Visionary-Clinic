import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { buildDemoCards, DEMO_EMAIL, DEMO_PASSWORD } from '../src/seed/demo-data';

const SALT_ROUNDS = 10;

const prisma = new PrismaClient();

/**
 * Standalone seed script wired up via the "prisma.seed" field in
 * package.json. Runs automatically after `prisma migrate dev` (and can be
 * re-run manually with `npx prisma db seed`). Idempotent — safe to re-run.
 */
async function main() {
  let demoUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demoUser) {
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
    demoUser = await prisma.user.create({
      data: { email: DEMO_EMAIL, password: hashedPassword, fullName: 'Demo User' },
    });
    console.log(`Seeded demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }

  const cardCount = await prisma.card.count();
  if (cardCount === 0) {
    const cards = buildDemoCards(demoUser.id);
    await prisma.card.createMany({ data: cards });
    console.log(`Seeded ${cards.length} demo cards`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
