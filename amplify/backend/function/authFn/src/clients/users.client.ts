import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersClient {
  private baseUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('USERS_SERVICE_URL', '');
  }

  async findUser(query: any) {
    if (!this.baseUrl) return null;
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/users/query`, query)
      );
      return response.data;
    } catch (error) {
      console.error('Users service error:', error);
      return null;
    }
  }

  async getUserById(userId: string, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/${userId}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Users service error:', error);
      return null;
    }
  }

  async getUserByReferralCode(referralCode: string, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/referral/${referralCode}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Users service error:', error);
      return null;
    }
  }

  async updateUserReferralStats(userId: string, referralCount: number, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/users/${userId}/referral-stats`, 
          { referralCount }, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Users service error:', error);
      return null;
    }
  }

  async findById(userId: string, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/${userId}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Users service error:', error);
      return null;
    }
  }

  async createUser(userData: any) {
    if (!this.baseUrl) return null;
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/users`, userData)
      );
      return response.data;
    } catch (error) {
      console.error('Users service error:', error);
      return null;
    }
  }

  async updateUser(userId: string, userData: any) {
    if (!this.baseUrl) return null;
    
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/users/${userId}`, userData)
      );
      return response.data;
    } catch (error) {
      console.error('Users service error:', error);
      return null;
    }
  }
}
