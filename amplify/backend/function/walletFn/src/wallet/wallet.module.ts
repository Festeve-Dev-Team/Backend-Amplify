import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletTransaction, WalletTransactionSchema } from './schemas/wallet-transaction.schema';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule,
  ],
  controllers: [WalletController],
  providers: [WalletService, AuthGuard],
  exports: [WalletService],
})
export class WalletModule {}


