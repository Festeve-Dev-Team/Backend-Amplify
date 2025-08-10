import {
  IsString,
  IsOptional,
  IsMongoId,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentRecordDto {
  @ApiProperty({ enum: ['order', 'booking'] })
  @IsEnum(['order', 'booking'])
  relatedTo: string;

  @ApiProperty()
  @IsMongoId()
  referenceId: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'razorpay' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'UPI' })
  @IsString()
  method: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentIntentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}


