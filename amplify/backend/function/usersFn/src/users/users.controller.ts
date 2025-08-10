import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';
import { User } from '../shared/common/decorators/user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all users with pagination and filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden - Admin only' })
  async findAll(@Query() query: UsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getMe(@User('sub') userId: string) {
    return this.usersService.findById(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async updateMe(
    @User('sub') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Validate address limit
    if (updateUserDto.addresses && updateUserDto.addresses.length > 10) {
      throw new BadRequestException('Maximum 10 addresses allowed');
    }

    return this.usersService.update(userId, updateUserDto);
  }

  @Patch(':id/wishlist/:productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 200, description: 'Product added to wishlist' })
  async addToWishlist(
    @Param('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.usersService.addToWishlist(userId, productId);
  }

  @Patch(':id/wishlist/:productId/remove')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  async removeFromWishlist(
    @Param('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.usersService.removeFromWishlist(userId, productId);
  }
}


