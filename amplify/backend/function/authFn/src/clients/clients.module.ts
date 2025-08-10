import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersClient } from './users.client';
import { ReferralClient } from './referral.client';

@Module({
  imports: [
    HttpModule.register({ timeout: 8000 }),
    ConfigModule,
  ],
  providers: [UsersClient, ReferralClient],
  exports: [UsersClient, ReferralClient],
})
export class ClientsModule {}
