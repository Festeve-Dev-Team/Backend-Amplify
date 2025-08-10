import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmDto {
  @ApiProperty()
  @IsString()
  token: string;
}


