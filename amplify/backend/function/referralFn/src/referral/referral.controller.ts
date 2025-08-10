import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ReferralService } from './referral.service';
import { ApplyReferralDto } from './dto/apply-referral.dto';
import { AuthGuard } from '../shared/common/guards/auth.guard';
import { User } from '../shared/common/decorators/user.decorator';

@ApiTags('Referral')
@Controller('referral')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('code')
  @ApiOperation({ summary: 'Get user referral code' })
  @ApiResponse({ status: 200, description: 'Referral code retrieved' })
  async getReferralCode(@User('sub') userId: string, @Req() req: any) {
    return this.referralService.getReferralCode(userId, req.headers.authorization);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply referral code' })
  @ApiResponse({ status: 200, description: 'Referral applied successfully' })
  @ApiResponse({ status: 400, description: 'Invalid referral code or already used' })
  async applyReferral(
    @User('sub') userId: string,
    @Body() applyReferralDto: ApplyReferralDto,
    @Req() req: any,
  ) {
    return this.referralService.applyReferral(userId, applyReferralDto.code, req.headers.authorization);
  }

  @Post('apply-signup')
  @ApiOperation({ summary: 'Apply referral code during signup (internal)' })
  @ApiResponse({ status: 200, description: 'Referral applied successfully' })
  async applyReferralOnSignup(
    @Body() body: { userId: string; referralCode: string },
    @Req() req: any,
  ) {
    return this.referralService.applyReferralOnSignup(body.userId, body.referralCode, req.headers.authorization);
  }
}


