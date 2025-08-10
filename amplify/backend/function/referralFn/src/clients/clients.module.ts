import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersClient } from './users.client';
import { WalletClient } from './wallet.client';

@Module({
  imports: [
    HttpModule.register({ timeout: 8000 }),
    ConfigModule,
  ],
  providers: [UsersClient, WalletClient],
  exports: [UsersClient, WalletClient],
})
export class ClientsModule {}
