import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsArray,
  IsMongoId,
  IsDate,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ComboItemDto {
  @ApiProperty()
  @IsMongoId()
  productId: string;

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOfferDto {
  @ApiProperty({ example: 'Festival Special' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Get 20% off on all products' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['percentage_discount', 'fixed_discount', 'combo', 'group_discount'] })
  @IsEnum(['percentage_discount', 'fixed_discount', 'combo', 'group_discount'])
  type: string;

  @ApiProperty({ enum: ['percentage', 'fixed'] })
  @IsEnum(['percentage', 'fixed'])
  discountType: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ type: [ComboItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboItemDto)
  comboItems?: ComboItemDto[];

  @ApiProperty({ enum: ['product', 'event', 'booking'] })
  @IsEnum(['product', 'event', 'booking'])
  appliesTo: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  targetIds: string[];

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minGroupSize?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxGroupSize?: number;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  combinable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  conditions?: Record<string, any>;
}


