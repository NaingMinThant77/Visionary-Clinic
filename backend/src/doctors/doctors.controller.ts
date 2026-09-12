import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { SearchDoctorsDto } from './dto/search-doctors.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // "me/*" routes must be declared before the ":id" route below, otherwise
  // Nest would try to parse "me" as a numeric doctor id.

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Get('me')
  getMyProfile(@CurrentUser() user: User) {
    return this.doctorsService.findMyProfile(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Get('me/schedules')
  getMySchedules(@CurrentUser() user: User) {
    return this.doctorsService.findMySchedules(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Post('me/schedules')
  createSchedule(@CurrentUser() user: User, @Body() dto: CreateScheduleDto) {
    return this.doctorsService.createSchedule(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Patch('me/schedules/:scheduleId')
  updateSchedule(
    @CurrentUser() user: User,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.doctorsService.updateSchedule(user.id, scheduleId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Delete('me/schedules/:scheduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSchedule(
    @CurrentUser() user: User,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ) {
    await this.doctorsService.deleteSchedule(user.id, scheduleId);
  }

  @Get()
  findAll(@Query() query: SearchDoctorsDto) {
    return this.doctorsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }
}
