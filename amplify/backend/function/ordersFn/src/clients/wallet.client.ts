import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WalletClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('WALLET_SERVICE_URL') || 'http://localhost:3000';
  }

  async getUserWallet(userId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/wallet/user/${userId}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user wallet:', error);
      throw error;
    }
  }

  async deductFromWallet(userId: string, amount: number, orderId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/wallet/${userId}/deduct`, 
          { amount, orderId }, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error deducting from wallet:', error);
      throw error;
    }
  }

  async refundToWallet(userId: string, amount: number, orderId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/wallet/${userId}/refund`, 
          { amount, orderId }, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error refunding to wallet:', error);
      throw error;
    }
  }
}
