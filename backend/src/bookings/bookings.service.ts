/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DayOfWeek, Prisma, Provider } from '@prisma/client';
import { toPlainDecimals } from '../common/decimal.util';
import { DoctorsService } from '../doctors/doctors.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

const DAY_OF_WEEK_BY_INDEX: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const BOOKING_INCLUDE = {
  doctor: {
    select: {
      id: true,
      specialization: true,
      hospitalDepartment: true,
      image: true,
      user: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  },
  provider: true,
  payments: { orderBy: { createdAt: 'desc' } },
} satisfies Prisma.BookingInclude;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly doctorsService: DoctorsService,
  ) {}

  async create(userId: number, dto: CreateBookingDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const schedule = await this.prisma.doctorSchedule.findUnique({
      where: { id: dto.scheduleId },
    });
    if (!schedule || schedule.doctorId !== dto.doctorId || !schedule.isActive) {
      throw new BadRequestException(
        'Selected schedule is not available for this doctor',
      );
    }

    const appointmentDate = new Date(dto.appointmentDate);
    const dayOfWeek = DAY_OF_WEEK_BY_INDEX[appointmentDate.getUTCDay()];
    if (dayOfWeek !== schedule.dayOfWeek) {
      throw new BadRequestException(
        `This schedule is only available on ${schedule.dayOfWeek}`,
      );
    }

    const startOfDay = new Date(
      Date.UTC(
        appointmentDate.getUTCFullYear(),
        appointmentDate.getUTCMonth(),
        appointmentDate.getUTCDate(),
      ),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const bookedCount = await this.prisma.booking.count({
      where: {
        doctorId: dto.doctorId,
        appointmentDate: { gte: startOfDay, lt: endOfDay },
        status: { not: 'CANCELLED' },
      },
    });
    if (bookedCount >= schedule.maximumPatientSession) {
      throw new BadRequestException(
        'This schedule is fully booked for the selected date',
      );
    }

    let insuranceDiscount = new Prisma.Decimal(0);
    if (dto.providerId) {
      const provider = await this.prisma.provider.findUnique({
        where: { id: dto.providerId },
      });
      if (!provider || !provider.isActive) {
        throw new BadRequestException(
          'Selected insurance provider is not available',
        );
      }
      insuranceDiscount = this.computeInsuranceDiscount(
        provider,
        schedule.consultationFees,
      );
    }

    const leftAmount = schedule.consultationFees.minus(insuranceDiscount);

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        doctorId: dto.doctorId,
        providerId: dto.providerId ?? null,
        fullName: dto.fullName,
        dob: new Date(dto.dob),
        gender: dto.gender,
        contactNumber: dto.contactNumber,
        nrc: dto.nrc,
        medicalNotes: dto.medicalNotes,
        paymentType: dto.paymentType,
        consultationFee: schedule.consultationFees,
        insuranceDiscount,
        depositAmount: 0,
        leftAmount,
        appointmentDate: startOfDay,
        status: 'PENDING',
      },
      include: BOOKING_INCLUDE,
    });
    return toPlainDecimals(booking);
  }

  async findMine(userId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: BOOKING_INCLUDE,
      orderBy: { appointmentDate: 'desc' },
    });
    return toPlainDecimals(bookings);
  }

  async findOwned(userId: number, id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException();
    }
    return toPlainDecimals(booking);
  }

  async cancel(userId: number, id: number) {
    const booking = await this.findOwned(userId, id);
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      throw new BadRequestException(
        `Booking is already ${booking.status.toLowerCase()}`,
      );
    }
    const cancelled = await this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: BOOKING_INCLUDE,
    });
    return toPlainDecimals(cancelled);
  }

  async findAssignedToDoctor(userId: number) {
    const doctorId = await this.doctorsService.getMyDoctorId(userId);
    const bookings = await this.prisma.booking.findMany({
      where: { doctorId },
      include: BOOKING_INCLUDE,
      orderBy: { appointmentDate: 'asc' },
    });
    return toPlainDecimals(bookings);
  }

  async findAssignedOneToDoctor(userId: number, id: number) {
    const doctorId = await this.doctorsService.getMyDoctorId(userId);
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }
    if (booking.doctorId !== doctorId) {
      throw new ForbiddenException();
    }
    return toPlainDecimals(booking);
  }

  private computeInsuranceDiscount(
    provider: Provider,
    consultationFee: Prisma.Decimal,
  ): Prisma.Decimal {
    if (provider.agreementType === 'PERCENTAGE') {
      return consultationFee.mul(provider.coveragePercentage).div(100);
    }
    if (provider.agreementType === 'FIXED') {
      const fixedAmount = new Prisma.Decimal(provider.coveragePercentage);
      return Prisma.Decimal.min(fixedAmount, consultationFee);
    }
    return new Prisma.Decimal(0);
  }
}
