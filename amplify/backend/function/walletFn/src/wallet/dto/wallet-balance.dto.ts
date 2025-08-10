import { ApiProperty } from '@nestjs/swagger';

export class WalletBalanceResponseDto {
  @ApiProperty({ example: 500 })
  money: number;

  @ApiProperty({ example: 150 })
  coins: number;

  @ApiProperty()
  userId: string;
}

export class MoneyBalanceResponseDto {
  @ApiProperty({ example: 500 })
  money: number;

  @ApiProperty()
  userId: string;
}

export class CoinBalanceResponseDto {
  @ApiProperty({ example: 150 })
  coins: number;

  @ApiProperty()
  userId: string;
}

export class TransactionResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ['credit', 'debit'] })
  type: string;

  @ApiProperty({ minimum: 0 })
  amount: number;

  @ApiProperty({ enum: ['money', 'coins'] })
  currency: string;

  @ApiProperty({ enum: ['referral', 'order', 'refund', 'admin'] })
  source: string;

  @ApiProperty({ type: 'object', required: false })
  meta?: Record<string, any>;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}

export class TransactionHistoryResponseDto {
  @ApiProperty({ type: [TransactionResponseDto] })
  transactions: TransactionResponseDto[];

  @ApiProperty({
    type: 'object',
    properties: {
      page: { type: 'number' },
      limit: { type: 'number' },
      total: { type: 'number' },
      pages: { type: 'number' }
    }
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}


