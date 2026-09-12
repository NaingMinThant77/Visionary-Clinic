import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { toPlainDecimals } from '../common/decimal.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive() {
    const providers = await this.prisma.provider.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return toPlainDecimals(providers);
  }

  async findAllForAdmin() {
    const providers = await this.prisma.provider.findMany({
      orderBy: { name: 'asc' },
    });
    return toPlainDecimals(providers);
  }

  async create(dto: CreateProviderDto) {
    const existing = await this.prisma.provider.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('A provider with this name already exists');
    }
    const provider = await this.prisma.provider.create({ data: dto });
    return toPlainDecimals(provider);
  }

  async update(id: number, dto: UpdateProviderDto) {
    const existing = await this.prisma.provider.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Provider ${id} not found`);
    }
    if (dto.name && dto.name !== existing.name) {
      const nameTaken = await this.prisma.provider.findUnique({
        where: { name: dto.name },
      });
      if (nameTaken) {
        throw new ConflictException('A provider with this name already exists');
      }
    }
    const updated = await this.prisma.provider.update({
      where: { id },
      data: dto,
    });
    return toPlainDecimals(updated);
  }
}
