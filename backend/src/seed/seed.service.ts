import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { buildDemoCards, DEMO_EMAIL, DEMO_PASSWORD } from './demo-data';

const SALT_ROUNDS = 10;

/**
 * Idempotent bootstrap seed: runs on every app start (not just `prisma
 * migrate dev`) so `npm run start:dev` alone always has working demo data.
 * Safe to run repeatedly — only inserts when the demo user / cards are missing.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    const demoUser = await this.seedDemoUser();
    await this.seedDemoCards(demoUser.id);
  }

  private async seedDemoUser(): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (existing) {
      return existing;
    }

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email: DEMO_EMAIL, password: hashedPassword, fullName: 'Demo User' },
    });
    this.logger.log(`Seeded demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    return user;
  }

  private async seedDemoCards(ownerId: number): Promise<void> {
    const count = await this.prisma.card.count();
    if (count > 0) {
      return;
    }

    const cards = buildDemoCards(ownerId);
    await this.prisma.card.createMany({ data: cards });
    this.logger.log(`Seeded ${cards.length} demo cards`);
  }
}
