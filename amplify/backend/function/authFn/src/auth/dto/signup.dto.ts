import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  ValidateIf,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  @ApiProperty({ 
    enum: ['auth0', 'firebase', 'cognito', 'native'],
    example: 'native' 
  })
  @IsEnum(['auth0', 'firebase', 'cognito', 'native'])
  provider: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerUserId?: string;

  @ApiPropertyOptional({ minLength: 8 })
  @ValidateIf(o => o.provider === 'native')
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({ example: 'ABC12345' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  referralCode?: string;
}


