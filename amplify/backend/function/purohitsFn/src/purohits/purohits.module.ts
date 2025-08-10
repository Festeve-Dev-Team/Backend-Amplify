import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PurohitsController } from './purohits.controller';
import { PurohitsService } from './purohits.service';
import { Purohit, PurohitSchema } from './schemas/purohit.schema';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { AdminGuard } from '../shared/common/guards/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purohit.name, schema: PurohitSchema },
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
  controllers: [PurohitsController],
  providers: [PurohitsService, AuthGuard, AdminGuard],
  exports: [PurohitsService],
})
export class PurohitsModule {}


