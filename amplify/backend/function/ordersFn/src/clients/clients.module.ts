import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ProductsClient } from './products.client';
import { CartClient } from './cart.client';
import { PaymentRecordsClient } from './payment-records.client';
import { WalletClient } from './wallet.client';

@Module({
  imports: [
    HttpModule.register({ timeout: 8000 }),
    ConfigModule,
  ],
  providers: [
    ProductsClient,
    CartClient,
    PaymentRecordsClient,
    WalletClient,
  ],
  exports: [
    ProductsClient,
    CartClient,
    PaymentRecordsClient,
    WalletClient,
  ],
})
export class ClientsModule {}
