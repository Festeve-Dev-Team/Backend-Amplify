import {
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 1, maximum: 50 })
  @IsNumber()
  @Min(1)
  @Max(50)
  quantity: number;
}


