/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: User) {
    return this.bookingsService.findMine(user.id);
  }

  // "assigned/*" routes must be declared before the ":id" route below,
  // otherwise Nest would try to parse "assigned" as a numeric booking id.

  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @Get('assigned')
  findAssigned(@CurrentUser() user: User) {
    return this.bookingsService.findAssignedToDoctor(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @Get('assigned/:id')
  findAssignedOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingsService.findAssignedOneToDoctor(user.id, id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOwned(user.id, id);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.cancel(user.id, id);
  }
}
