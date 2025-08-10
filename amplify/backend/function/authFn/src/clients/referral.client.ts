import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReferralClient {
  private baseUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('REFERRAL_SERVICE_URL', '');
  }

  async createReferral(referralData: any) {
    if (!this.baseUrl) return null;
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/referrals`, referralData)
      );
      return response.data;
    } catch (error) {
      console.error('Referral service error:', error);
      return null;
    }
  }

  async processReferralReward(userId: string, referrerId: string) {
    if (!this.baseUrl) return null;
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/referrals/reward`, {
          userId,
          referrerId,
        })
      );
      return response.data;
    } catch (error) {
      console.error('Referral service error:', error);
      return null;
    }
  }

  async applyReferralOnSignup(userId: string, referralCode: string, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/referrals/apply-signup`, {
          userId,
          referralCode,
        }, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Referral service error:', error);
      return null;
    }
  }
}
