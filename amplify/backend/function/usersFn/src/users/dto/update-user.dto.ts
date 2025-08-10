import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  IsPhoneNumber,
  IsBoolean,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsString()
  line1: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiPropertyOptional()
  @IsString()
  city: string;

  @ApiPropertyOptional()
  @IsString()
  state: string;

  @ApiPropertyOptional()
  @IsString()
  pincode: string;

  @ApiPropertyOptional()
  @IsString()
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

class SpecialPersonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  birthday?: Date;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({ type: SpecialPersonDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SpecialPersonDto)
  specialPersonDetails?: SpecialPersonDto;

  @ApiPropertyOptional({ type: [AddressDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}


