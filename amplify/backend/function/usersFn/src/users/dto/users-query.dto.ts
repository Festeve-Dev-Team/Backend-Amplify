import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UsersQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Number of users per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'john', description: 'Search by name, email, or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['user', 'admin'], description: 'Filter by user role' })
  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: string;

  @ApiPropertyOptional({ 
    enum: ['auth0', 'firebase', 'cognito', 'native'], 
    description: 'Filter by authentication provider' 
  })
  @IsOptional()
  @IsEnum(['auth0', 'firebase', 'cognito', 'native'])
  provider?: string;
}


