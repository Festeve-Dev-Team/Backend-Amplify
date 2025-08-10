import {
  IsString,
  IsOptional,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'Sweet Delights Vendor' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: [String], description: 'Product IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  productIds?: string[];
}


