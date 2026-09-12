import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('A category with this name already exists');
    }
    return this.prisma.category.create({ data: dto });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    if (dto.name && dto.name !== existing.name) {
      const nameTaken = await this.prisma.category.findUnique({
        where: { name: dto.name },
      });
      if (nameTaken) {
        throw new ConflictException('A category with this name already exists');
      }
    }
    return this.prisma.category.update({ where: { id }, data: dto });
  }
}
