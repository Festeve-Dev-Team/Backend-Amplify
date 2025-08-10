import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    enum: ['auth0', 'firebase', 'cognito', 'native'],
    example: 'native' 
  })
  @IsEnum(['auth0', 'firebase', 'cognito', 'native'])
  provider: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @ValidateIf(o => o.provider === 'native')
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @ValidateIf(o => o.provider === 'native')
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @ValidateIf(o => o.provider !== 'native')
  @IsString()
  providerToken?: string;

  @ApiPropertyOptional()
  @ValidateIf(o => o.provider !== 'native')
  @IsString()
  providerUserId?: string;
}


