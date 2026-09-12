import { IsIn } from 'class-validator';

export class UpdateAttendanceDto {
  @IsIn(['COMPLETED', 'ABSENT'])
  status: 'COMPLETED' | 'ABSENT';
}
