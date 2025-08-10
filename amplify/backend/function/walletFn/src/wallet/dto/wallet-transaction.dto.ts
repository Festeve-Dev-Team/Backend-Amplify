import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWalletTransactionDto {
  @ApiProperty({ minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: ['money', 'coins'] })
  @IsEnum(['money', 'coins'])
  currency: 'money' | 'coins';

  @ApiProperty({ enum: ['referral', 'order', 'refund', 'admin'] })
  @IsEnum(['referral', 'order', 'refund', 'admin'])
  source: string;

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  meta?: Record<string, any>;
}

export class WalletTransactionQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['credit', 'debit'] })
  @IsOptional()
  @IsEnum(['credit', 'debit'])
  type?: 'credit' | 'debit';

  @ApiPropertyOptional({ enum: ['money', 'coins'] })
  @IsOptional()
  @IsEnum(['money', 'coins'])
  currency?: 'money' | 'coins';
}


