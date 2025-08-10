import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';
import { User } from '../shared/common/decorators/user.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(
    @User('sub') userId: string,
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: any,
  ) {
    return this.ordersService.create(userId, createOrderDto, req.headers.authorization);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders or all orders (admin)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(@User() user: any) {
    const userId = user.role === 'admin' ? undefined : user.sub;
    return this.ordersService.findAll(userId);
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStats() {
    return this.ordersService.getStats();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string, @User() user: any) {
    const userId = user.role === 'admin' ? undefined : user.sub;
    return this.ordersService.findOne(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.ordersService.updateStatus(id, body.status);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancel(@Param('id') id: string, @User() user: any) {
    const userId = user.role === 'admin' ? undefined : user.sub;
    return this.ordersService.cancel(id, userId);
  }

  @Patch(':id/recalculate-payment')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recalculate payment status from payment records (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment status recalculated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async recalculatePaymentStatus(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.calculatePaymentStatus(id, req.headers.authorization);
  }
}


