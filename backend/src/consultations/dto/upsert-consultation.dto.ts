import { IsOptional, IsString } from 'class-validator';

export class UpsertConsultationDto {
  @IsOptional()
  @IsString()
  consultationNotes?: string;

  @IsOptional()
  @IsString()
  diagnosisDetails?: string;

  @IsOptional()
  @IsString()
  prescription?: string;
}
