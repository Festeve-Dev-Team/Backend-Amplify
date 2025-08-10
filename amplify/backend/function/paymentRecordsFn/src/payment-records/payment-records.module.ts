import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PaymentRecordsController } from './payment-records.controller';
import { PaymentRecordsService } from './payment-records.service';
import { PaymentRecord, PaymentRecordSchema } from './schemas/payment-record.schema';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentRecord.name, schema: PaymentRecordSchema },
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
  ],
  controllers: [PaymentRecordsController],
  providers: [PaymentRecordsService, AuthGuard, AdminGuard],
  exports: [PaymentRecordsService],
})
export class PaymentRecordsModule {}


