import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { User } from '../shared/common/decorators/user.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@User('sub') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  @ApiResponse({ status: 400, description: 'Maximum quantity exceeded' })
  async addToCart(
    @User('sub') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Patch('items/:productId/:variantId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  async updateCartItem(
    @User('sub') userId: string,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(userId, productId, variantId, updateCartItemDto);
  }

  @Delete('items/:productId/:variantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  async removeFromCart(
    @User('sub') userId: string,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.cartService.removeFromCart(userId, productId, variantId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@User('sub') userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get cart item count' })
  @ApiResponse({ status: 200, description: 'Cart count retrieved' })
  async getCartItemCount(@User('sub') userId: string) {
    const count = await this.cartService.getCartItemCount(userId);
    return { count };
  }
}


