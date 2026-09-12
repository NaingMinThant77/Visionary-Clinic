import { User as PrismaUser, UserRole } from '@prisma/client';
import { Exclude } from 'class-transformer';

/**
 * Response-shaping wrapper around the Prisma `User` model.
 *
 * Prisma returns plain objects, so this class is used to ensure
 * sensitive fields such as `password` are excluded from API responses
 * when ClassSerializerInterceptor is enabled.
 */
export class User implements PrismaUser {
  id: number;
  email: string;

  @Exclude()
  password: string;

  fullName: string;
  role: UserRole;

  bio: string | null;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: PrismaUser) {
    Object.assign(this, partial);
  }
}
