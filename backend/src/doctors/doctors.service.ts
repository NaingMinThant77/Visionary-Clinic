import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toPlainDecimals } from '../common/decimal.util';
import { PrismaService } from '../prisma/prisma.service';
import { SearchDoctorsDto } from './dto/search-doctors.dto';

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
        ? { specialization: { equals: query.specialization, mode: 'insensitive' } }
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
}
