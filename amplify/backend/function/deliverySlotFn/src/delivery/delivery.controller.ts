import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { DeliverySlotService } from './delivery-slot.service';
import { CreateDeliverySlotDto } from './dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from './dto/update-delivery-slot.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';

@ApiTags('Delivery')
@Controller('delivery-slots')
export class DeliveryController {
  constructor(private readonly deliverySlotService: DeliverySlotService) {}

  @Get()
  @ApiOperation({ summary: 'Get all delivery slots' })
  @ApiResponse({ status: 200, description: 'Delivery slots retrieved successfully' })
  async getAllSlots() {
    return this.deliverySlotService.getAllSlots();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get available delivery slots for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Available slots retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid product ID' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getAvailableSlots(@Param('productId') productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }
    
    return this.deliverySlotService.getAvailableSlots(new Types.ObjectId(productId));
  }

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new delivery slot (Admin only)' })
  @ApiResponse({ status: 201, description: 'Delivery slot created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async createSlot(@Body() createDeliverySlotDto: CreateDeliverySlotDto) {
    return this.deliverySlotService.createSlot(createDeliverySlotDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a delivery slot (Admin only)' })
  @ApiResponse({ status: 200, description: 'Delivery slot updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Delivery slot not found' })
  async updateSlot(
    @Param('id') id: string,
    @Body() updateDeliverySlotDto: UpdateDeliverySlotDto,
  ) {
    return this.deliverySlotService.updateSlot(id, updateDeliverySlotDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a delivery slot (Admin only)' })
  @ApiResponse({ status: 200, description: 'Delivery slot deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Delivery slot not found' })
  async deleteSlot(@Param('id') id: string) {
    return this.deliverySlotService.deleteSlot(id);
  }

  @Post(':id/reserve')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reserve a delivery slot' })
  @ApiResponse({ status: 200, description: 'Slot reserved successfully' })
  @ApiResponse({ status: 400, description: 'Slot not available or fully booked' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reserveSlot(@Param('id') id: string) {
    return this.deliverySlotService.reserveSlot(id);
  }

  @Post(':id/release')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release a delivery slot reservation' })
  @ApiResponse({ status: 200, description: 'Slot released successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Slot not found or no orders to release' })
  async releaseSlot(@Param('id') id: string) {
    return this.deliverySlotService.releaseSlot(id);
  }
}


