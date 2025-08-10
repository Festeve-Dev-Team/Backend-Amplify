import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ProductsClient } from './products.client';

@Module({
  imports: [
    HttpModule.register({ timeout: 8000 }),
    ConfigModule,
  ],
  providers: [
    ProductsClient,
  ],
  exports: [
    ProductsClient,
  ],
})
export class ClientsModule {}
