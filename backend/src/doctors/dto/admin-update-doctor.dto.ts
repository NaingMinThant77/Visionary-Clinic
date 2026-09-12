import { IsOptional, IsString } from 'class-validator';

export class AdminUpdateDoctorDto {
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  medicalLicenseNumber?: string;

  @IsOptional()
  @IsString()
  hospitalDepartment?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
