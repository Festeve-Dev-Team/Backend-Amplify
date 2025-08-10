import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WalletClient {
  private baseUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('WALLET_BASE_URL', '');
  }

  async addCoins(
    userId: string, 
    amount: number, 
    type: string, 
    metadata?: any, 
    auth?: string
  ) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/wallet/add-coins`, {
          userId,
          amount,
          type,
          metadata,
        }, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Wallet service error:', error);
      return null;
    }
  }

  async getBalance(userId: string, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/wallet/${userId}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Wallet service error:', error);
      return null;
    }
  }
}
