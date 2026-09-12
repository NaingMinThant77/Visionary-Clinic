import { IsDateString } from 'class-validator';

export class AttendanceDateQueryDto {
  @IsDateString()
  date: string;
}
