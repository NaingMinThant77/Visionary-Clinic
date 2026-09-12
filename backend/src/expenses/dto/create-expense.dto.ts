import { IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsInt()
  categoryId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  expenseDate: string;
}
