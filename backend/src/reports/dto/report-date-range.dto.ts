import { IsDateString } from 'class-validator';

export class ReportDateRangeDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}
