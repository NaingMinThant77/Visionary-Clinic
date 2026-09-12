import { Body, Controller, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { ConsultationsService } from './consultations.service';
import { UpsertConsultationDto } from './dto/upsert-consultation.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
@Controller('bookings/:bookingId/consultation')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Put()
  upsert(
    @CurrentUser() user: User,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body() dto: UpsertConsultationDto,
  ) {
    return this.consultationsService.upsertForDoctor(user.id, bookingId, dto);
  }
}
