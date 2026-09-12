import { Gender, PaymentType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  doctorId: number;

  @IsInt()
  scheduleId: number;

  @IsDateString()
  appointmentDate: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsDateString()
  dob: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsString()
  @IsNotEmpty()
  nrc: string;

  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsOptional()
  @IsInt()
  providerId?: number;
}
