import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BookingsService } from '../bookings/bookings.service';
import { toPlainDecimals } from '../common/decimal.util';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingsService: BookingsService,
  ) {}

  async process(userId: number, bookingId: number, dto: ProcessPaymentDto) {
    const booking = await this.bookingsService.findOwned(userId, bookingId);
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      throw new BadRequestException(
        `Cannot pay for a ${booking.status.toLowerCase()} booking`,
      );
    }

    // booking.leftAmount/depositAmount come back as plain numbers (see
    // toPlainDecimals) - re-wrap as Decimal here for exact currency math.
    const amount = new Prisma.Decimal(dto.amount);
    const leftAmount = new Prisma.Decimal(booking.leftAmount);
    const depositAmount = new Prisma.Decimal(booking.depositAmount);

    if (amount.greaterThan(leftAmount)) {
      throw new BadRequestException('Amount exceeds the remaining balance');
    }

    const newLeftAmount = leftAmount.minus(amount);
    const newDepositAmount = depositAmount.plus(amount);
    const newStatus =
      booking.status === 'PENDING' && newLeftAmount.lessThanOrEqualTo(0)
        ? 'CONFIRMED'
        : booking.status;

    // Simulates an instantly-settling payment gateway - real integrations
    // would create the Payment as PENDING and confirm it via webhook instead.
    await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          bookingId,
          amount,
          paymentType: dto.paymentType,
          paymentStatus: 'PAID',
          transactionReference:
            dto.transactionReference ?? this.generateReference(),
          paidAt: new Date(),
        },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          leftAmount: newLeftAmount,
          depositAmount: newDepositAmount,
          status: newStatus,
        },
      }),
    ]);

    return this.bookingsService.findOwned(userId, bookingId);
  }

  async findForBooking(userId: number, bookingId: number) {
    await this.bookingsService.findOwned(userId, bookingId);
    const payments = await this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
    return toPlainDecimals(payments);
  }

  private generateReference(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}
