import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DoctorsService } from '../doctors/doctors.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertConsultationDto } from './dto/upsert-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly doctorsService: DoctorsService,
  ) {}

  async upsertForDoctor(
    userId: number,
    bookingId: number,
    dto: UpsertConsultationDto,
  ) {
    const doctorId = await this.doctorsService.getMyDoctorId(userId);
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }
    if (booking.doctorId !== doctorId) {
      throw new ForbiddenException();
    }

    return this.prisma.consultation.upsert({
      where: { bookingId },
      create: { bookingId, doctorId, ...dto },
      update: { ...dto },
    });
  }
}
