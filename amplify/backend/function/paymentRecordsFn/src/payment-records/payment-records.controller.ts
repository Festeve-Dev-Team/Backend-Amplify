import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentRecordsService } from './payment-records.service';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';
import { User } from '../shared/common/decorators/user.decorator';

@ApiTags('Payment Records')
@Controller('payment-records')
export class PaymentRecordsController {
  constructor(private readonly paymentRecordsService: PaymentRecordsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment record (Internal use)' })
  @ApiResponse({ status: 201, description: 'Payment record created' })
  async create(
    @User('id') userId: string,
    @Body() createPaymentRecordDto: CreatePaymentRecordDto,
  ) {
    return this.paymentRecordsService.create(userId, createPaymentRecordDto);
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payment records (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment records retrieved' })
  async findAll() {
    return this.paymentRecordsService.findAll();
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStats() {
    return this.paymentRecordsService.getStats();
  }

  @Get(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a payment record by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment record retrieved' })
  @ApiResponse({ status: 404, description: 'Payment record not found' })
  async findOne(@Param('id') id: string) {
    return this.paymentRecordsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment record status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment status updated' })
  @ApiResponse({ status: 404, description: 'Payment record not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; paidAt?: Date },
  ) {
    return this.paymentRecordsService.updateStatus(id, body.status, body.paidAt);
  }
}


