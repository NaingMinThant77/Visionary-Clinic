import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AttendanceService } from './attendance.service';
import { AttendanceDateQueryDto } from './dto/attendance-date-query.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/bookings')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  findByDate(@Query() query: AttendanceDateQueryDto) {
    return this.attendanceService.findBookingsForDate(query.date);
  }

  @Post(':id/check-in')
  checkIn(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.checkIn(id);
  }

  @Patch(':id/attendance')
  updateAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.updateAttendance(id, dto.status);
  }
}
