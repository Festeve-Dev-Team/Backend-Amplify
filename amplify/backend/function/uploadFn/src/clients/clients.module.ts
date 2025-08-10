import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.register({ timeout: 8000 }),
    ConfigModule,
  ],
  providers: [],
  exports: [],
})
export class ClientsModule {}
