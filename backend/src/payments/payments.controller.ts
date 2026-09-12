import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentsService } from './payments.service';

@UseGuards(JwtAuthGuard)
@Controller('bookings/:bookingId/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  process(
    @CurrentUser() user: User,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.paymentsService.process(user.id, bookingId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.paymentsService.findForBooking(user.id, bookingId);
  }
}
