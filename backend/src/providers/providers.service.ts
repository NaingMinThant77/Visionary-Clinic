import { Injectable } from '@nestjs/common';
import { toPlainDecimals } from '../common/decimal.util';
import { PrismaService } from '../prisma/prisma.service';

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
}
