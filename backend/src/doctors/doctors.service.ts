import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toPlainDecimals } from '../common/decimal.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { SearchDoctorsDto } from './dto/search-doctors.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

const DOCTOR_SELECT = {
  id: true,
  specialization: true,
  medicalLicenseNumber: true,
  hospitalDepartment: true,
  image: true,
  user: {
    select: { id: true, fullName: true, avatarUrl: true, bio: true },
  },
  schedules: {
    where: { isActive: true },
    orderBy: { dayOfWeek: 'asc' },
  },
} satisfies Prisma.DoctorSelect;

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: SearchDoctorsDto) {
    const search = query.search?.trim();

    const where: Prisma.DoctorWhereInput = {
      ...(query.specialization
        ? {
            specialization: {
              equals: query.specialization,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { specialization: { contains: search, mode: 'insensitive' } },
              { hospitalDepartment: { contains: search, mode: 'insensitive' } },
              { user: { fullName: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const doctors = await this.prisma.doctor.findMany({
      where,
      select: DOCTOR_SELECT,
      orderBy: { user: { fullName: 'asc' } },
    });
    return toPlainDecimals(doctors);
  }

  async findOne(id: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      select: DOCTOR_SELECT,
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor ${id} not found`);
    }
    return toPlainDecimals(doctor);
  }

  /** Resolves the Doctor profile id for a logged-in user with role DOCTOR. */
  async getMyDoctorId(userId: number): Promise<number> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!doctor) {
      throw new NotFoundException(
        'No doctor profile is linked to this account',
      );
    }
    return doctor.id;
  }

  async findMyProfile(userId: number) {
    const doctorId = await this.getMyDoctorId(userId);
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        specialization: true,
        medicalLicenseNumber: true,
        hospitalDepartment: true,
        image: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });
    return toPlainDecimals(doctor);
  }

  async findMySchedules(userId: number) {
    const doctorId = await this.getMyDoctorId(userId);
    const schedules = await this.prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    console.log('MySchedule: ', schedules);
    return toPlainDecimals(schedules);
  }

  async createSchedule(userId: number, dto: CreateScheduleDto) {
    const doctorId = await this.getMyDoctorId(userId);
    this.assertValidTimeRange(dto.startTime, dto.endTime);

    const schedule = await this.prisma.doctorSchedule.create({
      data: { doctorId, ...dto },
    });
    return toPlainDecimals(schedule);
  }

  async updateSchedule(
    userId: number,
    scheduleId: number,
    dto: UpdateScheduleDto,
  ) {
    const doctorId = await this.getMyDoctorId(userId);
    const schedule = await this.getOwnedSchedule(doctorId, scheduleId);

    this.assertValidTimeRange(
      dto.startTime ?? schedule.startTime,
      dto.endTime ?? schedule.endTime,
    );

    const updated = await this.prisma.doctorSchedule.update({
      where: { id: scheduleId },
      data: dto,
    });
    return toPlainDecimals(updated);
  }

  async deleteSchedule(userId: number, scheduleId: number): Promise<void> {
    const doctorId = await this.getMyDoctorId(userId);
    await this.getOwnedSchedule(doctorId, scheduleId);
    await this.prisma.doctorSchedule.delete({ where: { id: scheduleId } });
  }

  private async getOwnedSchedule(doctorId: number, scheduleId: number) {
    const schedule = await this.prisma.doctorSchedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule || schedule.doctorId !== doctorId) {
      throw new NotFoundException(`Schedule ${scheduleId} not found`);
    }
    return schedule;
  }

  private assertValidTimeRange(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }
  }
}
