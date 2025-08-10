import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyReferralDto {
  @ApiProperty({ example: 'ABC12345', minLength: 8, maxLength: 8 })
  @IsString()
  @Length(8, 8)
  code: string;
}


