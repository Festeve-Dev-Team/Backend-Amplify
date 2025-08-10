import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('USERS_SERVICE_URL') || 'http://localhost:3000';
  }

  async getUserById(id: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/${id}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: any, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/users/${id}`, updateData, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async findUserByQuery(query: any, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/users/query`, query, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error finding user by query:', error);
      throw error;
    }
  }

  async updateUserWallet(userId: string, walletUpdate: any, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/users/${userId}/wallet`, 
          walletUpdate, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user wallet:', error);
      throw error;
    }
  }
}
