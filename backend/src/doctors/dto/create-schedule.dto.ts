import { DayOfWeek } from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsPositive, Matches, Min } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateScheduleDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @Matches(TIME_PATTERN, { message: 'startTime must be in HH:MM (24h) format' })
  startTime: string;

  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:MM (24h) format' })
  endTime: string;

  @IsInt()
  @Min(1)
  maximumPatientSession: number;

  @IsNumber()
  @IsPositive()
  consultationFees: number;
}
