import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AdminCreateDoctorDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsString()
  @IsNotEmpty()
  medicalLicenseNumber: string;

  @IsOptional()
  @IsString()
  hospitalDepartment?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
