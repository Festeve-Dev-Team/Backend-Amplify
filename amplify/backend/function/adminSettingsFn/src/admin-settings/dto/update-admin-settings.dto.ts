import {
  IsOptional,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class HomepageSectionDto {
  @ApiPropertyOptional({ enum: ['whatsToday', 'trending', 'flashSale', 'exclusiveOffer', 'bestDeal', 'testimonials'] })
  @IsEnum(['whatsToday', 'trending', 'flashSale', 'exclusiveOffer', 'bestDeal', 'testimonials'])
  key!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  eventId?: string;
}

class BannerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  imageUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  eventId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAdminSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  dailyEventId?: string;

  @ApiPropertyOptional({ type: [HomepageSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomepageSectionDto)
  homepageSections?: HomepageSectionDto[];

  @ApiPropertyOptional({ type: [BannerDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BannerDto)
  banners?: BannerDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  featuredProductIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  featuredEventIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  manuallyCuratedTrending?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  customSections?: Record<string, any>;
}


