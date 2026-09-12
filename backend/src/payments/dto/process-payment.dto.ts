import { PaymentType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ProcessPaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsOptional()
  @IsString()
  transactionReference?: string;
}
