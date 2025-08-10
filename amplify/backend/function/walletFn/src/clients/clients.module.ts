import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersClient } from './users.client';

@Module({
  imports: [
    HttpModule.register({ timeout: 8000 }),
    ConfigModule,
  ],
  providers: [
    UsersClient,
  ],
  exports: [
    UsersClient,
  ],
})
export class ClientsModule {}
