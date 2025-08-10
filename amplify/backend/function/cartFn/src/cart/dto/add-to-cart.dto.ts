import {
  IsMongoId,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty()
  @IsMongoId()
  productId: string;

  @ApiProperty()
  @IsMongoId()
  variantId: string;

  @ApiProperty({ minimum: 1, maximum: 50 })
  @IsNumber()
  @Min(1)
  @Max(50)
  quantity: number;
}


