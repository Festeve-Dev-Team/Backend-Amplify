import { IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SignupDto } from './signup.dto';

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code: string;

  @ApiProperty({ type: SignupDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SignupDto)
  signupData: SignupDto;
}


