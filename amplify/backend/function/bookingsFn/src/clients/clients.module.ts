import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { EventsClient } from './events.client';
import { PaymentRecordsClient } from './payment-records.client';

@Module({
  imports: [
    HttpModule.register({ timeout: 8000 }),
    ConfigModule,
  ],
  providers: [EventsClient, PaymentRecordsClient],
  exports: [EventsClient, PaymentRecordsClient],
})
export class ClientsModule {}
