import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { Referral, ReferralSchema } from './schemas/referral.schema';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
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
  controllers: [ReferralController],
  providers: [ReferralService, AuthGuard],
  exports: [ReferralService],
})
export class ReferralModule {}


