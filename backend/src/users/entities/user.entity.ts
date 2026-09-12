import { User as PrismaUser } from '@prisma/client';
import { Exclude } from 'class-transformer';

/**
 * Response-shaping wrapper around the Prisma `User` model. Prisma returns
 * plain objects, so `password` needs an explicit `@Exclude()` on a real class
 * instance for `ClassSerializerInterceptor` to strip it from JSON responses.
 */
export class User implements PrismaUser {
  id: number;
  email: string;

  @Exclude()
  password: string;

  fullName: string;
  bio: string | null;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  createdAt: Date;

  constructor(partial: PrismaUser) {
    Object.assign(this, partial);
  }
}
