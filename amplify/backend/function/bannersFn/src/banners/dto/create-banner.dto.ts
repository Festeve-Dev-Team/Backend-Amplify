import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty({ example: 'https://example.com/banner.jpg' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ example: 'https://example.com/product/123' })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


