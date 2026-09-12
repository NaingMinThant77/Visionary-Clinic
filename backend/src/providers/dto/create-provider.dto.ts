import { AgreementType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  coveragePercentage: number;

  @IsEnum(AgreementType)
  agreementType: AgreementType;

  @IsOptional()
  @IsString()
  rule?: string;
}
