import {
  IsString,
  IsOptional,
  IsMongoId,
  IsDate,
  IsNumber,
  Min,
  IsBoolean,
  ValidateNested,
  ValidateIf,
  Max,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'purohitOrEvent', async: false })
class PurohitOrEventConstraint implements ValidatorConstraintInterface {
  validate(value: any, args?: any) {
    const object = args?.object;
    return !!(object?.purohitId || object?.eventId);
  }

  defaultMessage() {
    return 'Either purohitId or eventId must be provided';
  }
}

class AddressDto {
  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  line1: string;

  @ApiPropertyOptional({ example: 'Near landmark' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  state: string;

  @ApiProperty({ example: '400001' })
  @IsString()
  pincode: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateBookingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  purohitId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  eventId?: string;

  @Validate(PurohitOrEventConstraint)
  private readonly _validation?: any;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ example: '10:00 AM' })
  @IsString()
  timeSlot: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isGroupBooking?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 50 })
  @ValidateIf(o => o.isGroupBooking)
  @IsNumber()
  @Min(1)
  @Max(50)
  groupSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  groupOfferId?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  extraNotes?: Record<string, any>;
}


