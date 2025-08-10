import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeliverySlotDto {
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  maxOrders: number;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentOrders?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}


