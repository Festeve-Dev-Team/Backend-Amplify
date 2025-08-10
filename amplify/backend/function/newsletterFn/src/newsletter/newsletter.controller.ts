import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { ConfirmDto } from './dto/confirm.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  @ApiResponse({ status: 400, description: 'Email already subscribed' })
  async subscribe(@Body() subscribeDto: SubscribeDto) {
    return this.newsletterService.subscribe(subscribeDto);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm newsletter subscription' })
  @ApiResponse({ status: 200, description: 'Email confirmed' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  async confirm(@Body() confirmDto: ConfirmDto) {
    return this.newsletterService.confirm(confirmDto);
  }

  @Get('unsubscribe/:token')
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiResponse({ status: 200, description: 'Successfully unsubscribed' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  async unsubscribe(@Param('token') token: string) {
    return this.newsletterService.unsubscribe(token);
  }

  @Get('subscribers')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all confirmed subscribers (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subscribers retrieved' })
  async getSubscribers() {
    return this.newsletterService.getSubscribers();
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get newsletter statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStats() {
    return this.newsletterService.getStats();
  }
}


