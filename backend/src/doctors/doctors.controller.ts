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
import { AdminCreateDoctorDto } from './dto/admin-create-doctor.dto';
import { AdminUpdateDoctorDto } from './dto/admin-update-doctor.dto';
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

  // Admin-only doctor management ("configureDoctorProfile").

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  createDoctor(@Body() dto: AdminCreateDoctorDto) {
    return this.doctorsService.adminCreateDoctor(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  updateDoctor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateDoctorDto,
  ) {
    return this.doctorsService.adminUpdateDoctor(id, dto);
  }

  // Admin-only: manage any doctor's availability schedule ("ManageDoctorSchedule").
  // Declared before ":id" for the same reason as the "me/*" routes above.

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':doctorId/schedules')
  getSchedulesForDoctor(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.doctorsService.findSchedulesForDoctor(doctorId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':doctorId/schedules')
  createScheduleForDoctor(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.doctorsService.createScheduleForDoctor(doctorId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':doctorId/schedules/:scheduleId')
  updateScheduleForDoctor(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.doctorsService.updateScheduleForDoctor(
      doctorId,
      scheduleId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':doctorId/schedules/:scheduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteScheduleForDoctor(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ) {
    await this.doctorsService.deleteScheduleForDoctor(doctorId, scheduleId);
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
