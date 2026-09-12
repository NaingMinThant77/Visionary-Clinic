import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { toPlainDecimals } from '../common/decimal.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const expenses = await this.prisma.expense.findMany({
      include: { category: true },
      orderBy: { expenseDate: 'desc' },
    });
    return toPlainDecimals(expenses);
  }

  async create(userId: number, dto: CreateExpenseDto) {
    await this.assertCategoryExists(dto.categoryId);

    const expense = await this.prisma.expense.create({
      data: {
        categoryId: dto.categoryId,
        createdById: userId,
        amount: dto.amount,
        description: dto.description,
        expenseDate: new Date(dto.expenseDate),
      },
      include: { category: true },
    });
    return toPlainDecimals(expense);
  }

  async update(id: number, dto: UpdateExpenseDto) {
    const existing = await this.prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Expense ${id} not found`);
    }
    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
    }

    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        amount: dto.amount,
        description: dto.description,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
      },
      include: { category: true },
    });
    return toPlainDecimals(updated);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Expense ${id} not found`);
    }
    await this.prisma.expense.delete({ where: { id } });
  }

  private async assertCategoryExists(categoryId: number): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('Selected category does not exist');
    }
  }
}
