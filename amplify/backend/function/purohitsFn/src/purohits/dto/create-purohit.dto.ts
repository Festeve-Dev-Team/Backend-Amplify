import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsNumber,
  Min,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsDate,
  Matches,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LocationDto {
  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  state: string;

  @ApiProperty({ example: '400001' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Pincode must be 6 digits' })
  pincode: string;
}

class AvailabilityDto {
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ type: [String], example: ['9:00 AM', '11:00 AM', '2:00 PM'] })
  @IsArray()
  @IsString({ each: true })
  timeSlots: string[];
}

export class CreatePurohitDto {
  @ApiProperty({ example: 'Pandit Ravi Sharma' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+911234567890' })
  @IsPhoneNumber('IN')
  phone: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ example: 15, minimum: 0 })
  @IsNumber()
  @Min(0)
  experienceYears: number;

  @ApiProperty({ 
    type: [String], 
    example: ['Ganesha Puja', 'Wedding Ceremonies', 'Housewarming'] 
  })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiPropertyOptional({ type: [AvailabilityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  availability?: AvailabilityDto[];

  @ApiPropertyOptional({ example: 'Experienced in traditional Vedic rituals' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  customSkills?: Record<string, any>;

  @ApiPropertyOptional({ 
    type: [String], 
    example: ['Ganesh Puja', 'Navagraha Homam', 'Satyanarayan Puja'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rituals?: string[];

  @ApiPropertyOptional({ 
    type: [String], 
    example: ['en', 'hi', 'te', 'mr'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  chargesCommission?: boolean;

  @ApiPropertyOptional({ enum: ['percentage', 'flat'] })
  @IsOptional()
  @ValidateIf(o => o.chargesCommission === true)
  @IsEnum(['percentage', 'flat'])
  commissionType?: 'percentage' | 'flat';

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @ValidateIf(o => o.chargesCommission === true)
  @IsNumber()
  @Min(0)
  commissionValue?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


