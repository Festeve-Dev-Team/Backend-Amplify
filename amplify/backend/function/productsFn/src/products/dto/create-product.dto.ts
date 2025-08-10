import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsMongoId,
  ValidateNested,
  Min,
  ArrayNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ProductVariantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  specs?: Record<string, any>;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ enum: ['percentage', 'fixed'] })
  @IsOptional()
  @IsEnum(['percentage', 'fixed'])
  discountType?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Divine Puja Kit' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Complete puja kit for home worship' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Category ID' })
  @IsMongoId()
  category: string;

  @ApiProperty({ type: [String], example: ['diwali-sweet', 'sankranthi-snack'] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Tags array cannot be empty' })
  @IsString({ each: true, message: 'Each tag must be a non-empty string' })
  tags: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isHotItem?: boolean;

  @ApiProperty({ type: [String], example: ['milk', 'sugar', 'cardamom'] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Ingredients array cannot be empty' })
  @IsString({ each: true, message: 'Each ingredient must be a non-empty string' })
  ingredients: string[];

  @ApiPropertyOptional({ type: [String], description: 'Vendor IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  vendors?: string[];

  @ApiProperty({ type: [ProductVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];

  @ApiPropertyOptional({ enum: ['percentage', 'fixed'] })
  @IsOptional()
  @IsEnum(['percentage', 'fixed'])
  defaultDiscountType?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultDiscountValue?: number;

  @ApiPropertyOptional({ type: [String], description: 'Linked event IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  linkedEvents?: string[];

  @ApiPropertyOptional({ enum: ['exclusive_offer', 'flash_sale', 'best_deal'] })
  @IsOptional()
  @IsEnum(['exclusive_offer', 'flash_sale', 'best_deal'])
  offerType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  offerStart?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  offerEnd?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isTrending?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  meta?: Record<string, any>;
}


