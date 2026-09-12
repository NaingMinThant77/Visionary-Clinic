import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { toPlainDecimals } from '../common/decimal.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findBookingsForDate(date: string) {
    const { start, end } = this.dayRange(date);
    const bookings = await this.prisma.booking.findMany({
      where: { appointmentDate: { gte: start, lt: end } },
      include: {
        doctor: {
          select: {
            id: true,
            specialization: true,
            user: { select: { id: true, fullName: true } },
          },
        },
        dailySchedule: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return toPlainDecimals(bookings);
  }

  async checkIn(bookingId: number) {
    const booking = await this.getBookingOrThrow(bookingId);

    if (booking.dailySchedule && booking.dailySchedule.status !== 'ABSENT') {
      // Already checked in (or completed) - idempotent, return as-is.
      return booking.dailySchedule;
    }

    const scheduleDate = this.startOfDay(booking.appointmentDate);
    const token = randomUUID();

    if (booking.dailySchedule) {
      return this.prisma.dailySchedule.update({
        where: { bookingId },
        data: {
          status: 'CHECKED_IN',
          token,
          checkInAt: new Date(),
          completedAt: null,
        },
      });
    }

    return this.prisma.dailySchedule.create({
      data: {
        bookingId,
        scheduleDate,
        status: 'CHECKED_IN',
        token,
        checkInAt: new Date(),
      },
    });
  }

  async updateAttendance(bookingId: number, status: 'COMPLETED' | 'ABSENT') {
    const booking = await this.getBookingOrThrow(bookingId);
    const scheduleDate = this.startOfDay(booking.appointmentDate);
    const completedAt = status === 'COMPLETED' ? new Date() : null;

    if (!booking.dailySchedule) {
      return this.prisma.dailySchedule.create({
        data: { bookingId, scheduleDate, status, completedAt },
      });
    }

    return this.prisma.dailySchedule.update({
      where: { bookingId },
      data: { status, completedAt },
    });
  }

  private async getBookingOrThrow(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { dailySchedule: true },
    });
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }
    return booking;
  }

  private startOfDay(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private dayRange(dateStr: string): { start: Date; end: Date } {
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  }
}
