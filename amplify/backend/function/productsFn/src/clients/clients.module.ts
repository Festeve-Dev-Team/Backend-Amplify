import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { VendorsClient } from './vendors.client';

@Module({
  imports: [
    HttpModule.register({ timeout: 8000 }),
    ConfigModule,
  ],
  providers: [
    VendorsClient,
  ],
  exports: [
    VendorsClient,
  ],
})
export class ClientsModule {}
