import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsBoolean,
  IsArray,
  IsMongoId,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RecurringDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'yearly'] })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'yearly'])
  frequency?: string;

  @ApiPropertyOptional({ type: [Number], description: '0=Sunday...6=Saturday' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];
}

class SpecialOfferDto {
  @ApiProperty({ enum: ['exclusive_offer', 'flash_sale', 'best_deal'] })
  @IsEnum(['exclusive_offer', 'flash_sale', 'best_deal'])
  offerType: string;

  @ApiProperty()
  @IsMongoId()
  productId: string;
}

class LinkedProductDto {
  @ApiProperty()
  @IsMongoId()
  productId: string;

  @ApiProperty({ enum: ['poojaKit', 'outfit', 'sweet', 'general'] })
  @IsEnum(['poojaKit', 'outfit', 'sweet', 'general'])
  relation: string;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Diwali Festival' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Festival of lights celebration' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ['festival', 'daily', 'weekly'], default: 'daily' })
  @IsEnum(['festival', 'daily', 'weekly'])
  type: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurringDto)
  recurring?: RecurringDto;

  @ApiPropertyOptional({ type: [LinkedProductDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkedProductDto)
  linkedProducts?: LinkedProductDto[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  purohitRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ritualNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @ApiPropertyOptional({ type: [SpecialOfferDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialOfferDto)
  specialOffers?: SpecialOfferDto[];

  @ApiPropertyOptional()
  @IsOptional()
  extraData?: Record<string, any>;
}


