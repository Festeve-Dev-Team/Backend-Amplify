import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DeliveryController } from './delivery.controller';
import { DeliverySlotService } from './delivery-slot.service';
import { DeliverySlot, DeliverySlotSchema } from './schemas/delivery-slot.schema';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliverySlot.name, schema: DeliverySlotSchema },
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
  controllers: [DeliveryController],
  providers: [DeliverySlotService, AuthGuard, AdminGuard],
  exports: [DeliverySlotService],
})
export class DeliveryModule {}


