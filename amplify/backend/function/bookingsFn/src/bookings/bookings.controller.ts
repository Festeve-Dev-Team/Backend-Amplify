import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';
import { User } from '../shared/common/decorators/user.decorator';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Time slot conflict' })
  async create(
    @User('sub') userId: string,
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: any,
  ) {
    return this.bookingsService.create(userId, createBookingDto, req.headers.authorization);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user bookings or all bookings (admin)' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  async findAll(@User() user: any) {
    const userId = user.role === 'admin' ? undefined : user.sub;
    return this.bookingsService.findAll(userId);
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStats() {
    return this.bookingsService.getStats();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id') id: string, @User() user: any) {
    const userId = user.role === 'admin' ? undefined : user.sub;
    return this.bookingsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async update(
    @Param('id') id: string,
    @User() user: any,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    const userId = user.role === 'admin' ? undefined : user.sub;
    return this.bookingsService.update(id, updateBookingDto, userId);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancel(@Param('id') id: string, @User() user: any) {
    const userId = user.role === 'admin' ? undefined : user.sub;
    return this.bookingsService.cancel(id, userId);
  }

  @Patch(':id/confirm')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm a booking (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot confirm booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async confirm(@Param('id') id: string) {
    return this.bookingsService.confirm(id);
  }

  @Patch(':id/recalculate-payment')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recalculate payment status from payment records (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment status recalculated' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async recalculatePaymentStatus(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.calculatePaymentStatus(id, req.headers.authorization);
  }
}


