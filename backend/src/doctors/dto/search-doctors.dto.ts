import { IsOptional, IsString } from 'class-validator';

export class SearchDoctorsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  specialization?: string;
}
