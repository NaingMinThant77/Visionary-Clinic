import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { deleteUploadedFile } from '../common/uploaded-files.util';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
}

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? new User(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? new User(user) : null;
  }

  count(): Promise<number> {
    return this.prisma.user.count();
  }

  async create(data: CreateUserInput): Promise<User> {
    const user = await this.prisma.user.create({ data });
    return new User(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    await this.getOrThrow(id);
    const user = await this.prisma.user.update({ where: { id }, data: dto });
    return new User(user);
  }

  async updateAvatar(id: number, avatarUrl: string): Promise<User> {
    const existing = await this.getOrThrow(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
    });
    await deleteUploadedFile(existing.avatarUrl);
    return new User(user);
  }

  async updateEmail(id: number, dto: UpdateEmailDto): Promise<User> {
    const user = await this.getOrThrow(id);
    await this.assertPasswordMatches(dto.currentPassword, user.password);

    const existing = await this.findByEmail(dto.email);
    if (existing && existing.id !== id) {
      throw new ConflictException('Email is already in use');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { email: dto.email },
    });
    return new User(updated);
  }

  async changePassword(id: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.getOrThrow(id);
    await this.assertPasswordMatches(dto.currentPassword, user.password);

    const password = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.prisma.user.update({ where: { id }, data: { password } });
  }

  // A wrong current password is a validation failure, not an auth failure -
  // it must NOT be a 401, or the frontend's global interceptor will treat it
  // as an expired session, clear the token, and bounce to /login.
  private async assertPasswordMatches(
    candidate: string,
    hash: string,
  ): Promise<void> {
    const matches = await bcrypt.compare(candidate, hash);
    if (!matches) {
      throw new BadRequestException('Current password is incorrect');
    }
  }

  private async getOrThrow(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }
}
