import {
  IsString,
  IsNumber,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestimonialDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Great service and excellent products!' })
  @IsString()
  @MinLength(10)
  message: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}


