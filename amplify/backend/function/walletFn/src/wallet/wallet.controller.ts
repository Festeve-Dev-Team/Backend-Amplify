import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { WalletService } from './wallet.service';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { User } from '../shared/common/decorators/user.decorator';
import {
  WalletBalanceResponseDto,
  MoneyBalanceResponseDto,
  CoinBalanceResponseDto,
} from './dto';
import { WalletBalance, TransactionHistoryResponse } from './interfaces/wallet.interface';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance (both money and coins)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet balance retrieved',
    type: WalletBalanceResponseDto
  })
  async getBalance(@User('sub') userId: string): Promise<WalletBalance> {
    return this.walletService.getBalance(userId);
  }

  @Get('balance/money')
  @ApiOperation({ summary: 'Get money balance only' })
  @ApiResponse({ status: 200, description: 'Money balance retrieved', type: MoneyBalanceResponseDto })
  async getMoneyBalance(@User('sub') userId: string): Promise<MoneyBalanceResponseDto> {
    const balance = await this.walletService.getMoneyBalance(userId);
    return { money: balance, userId };
  }

  @Get('balance/coins')
  @ApiOperation({ summary: 'Get coin balance only' })
  @ApiResponse({ status: 200, description: 'Coin balance retrieved', type: CoinBalanceResponseDto })
  async getCoinBalance(@User('sub') userId: string): Promise<CoinBalanceResponseDto> {
    const balance = await this.walletService.getCoinBalance(userId);
    return { coins: balance, userId };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['credit', 'debit'] })
  @ApiQuery({ name: 'currency', required: false, enum: ['money', 'coins'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Transaction history retrieved'
  })
  async getTransactions(
    @User('sub') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('type') type?: 'credit' | 'debit',
    @Query('currency') currency?: 'money' | 'coins',
  ): Promise<TransactionHistoryResponse> {
    return this.walletService.getTransactions(userId, { page, limit, type, currency });
  }

  @Get('transactions/money')
  @ApiOperation({ summary: 'Get money transaction history only' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['credit', 'debit'] })
  @ApiResponse({ status: 200, description: 'Money transaction history retrieved' })
  async getMoneyTransactions(
    @User('sub') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('type') type?: 'credit' | 'debit',
  ): Promise<TransactionHistoryResponse> {
    return this.walletService.getTransactions(userId, { page, limit, type, currency: 'money' });
  }

  @Get('transactions/coins')
  @ApiOperation({ summary: 'Get coin transaction history only' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['credit', 'debit'] })
  @ApiResponse({ status: 200, description: 'Coin transaction history retrieved' })
  async getCoinTransactions(
    @User('sub') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('type') type?: 'credit' | 'debit',
  ): Promise<TransactionHistoryResponse> {
    return this.walletService.getTransactions(userId, { page, limit, type, currency: 'coins' });
  }

  @Post('add-coins')
  @ApiOperation({ summary: 'Add coins to wallet (internal)' })
  @ApiResponse({ status: 200, description: 'Coins added successfully' })
  async addCoins(
    @Body() body: { userId: string; amount: number; source: string; meta?: Record<string, any> }
  ) {
    return this.walletService.addCoins(body.userId, body.amount, body.source, body.meta);
  }

  @Post('add-money')
  @ApiOperation({ summary: 'Add money to wallet (internal)' })
  @ApiResponse({ status: 200, description: 'Money added successfully' })
  async addMoney(
    @Body() body: { userId: string; amount: number; source: string; meta?: Record<string, any> }
  ) {
    return this.walletService.addMoney(body.userId, body.amount, body.source, body.meta);
  }

  @Post('debit-coins')
  @ApiOperation({ summary: 'Debit coins from wallet (internal)' })
  @ApiResponse({ status: 200, description: 'Coins debited successfully' })
  async debitCoins(
    @Body() body: { userId: string; amount: number; source: string; meta?: Record<string, any> }
  ) {
    return this.walletService.debitCoins(body.userId, body.amount, body.source, body.meta);
  }

  @Post('debit-money')
  @ApiOperation({ summary: 'Debit money from wallet (internal)' })
  @ApiResponse({ status: 200, description: 'Money debited successfully' })
  async debitMoney(
    @Body() body: { userId: string; amount: number; source: string; meta?: Record<string, any> }
  ) {
    return this.walletService.debitMoney(body.userId, body.amount, body.source, body.meta);
  }
}


