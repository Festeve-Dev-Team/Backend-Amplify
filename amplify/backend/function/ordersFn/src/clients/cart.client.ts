import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CartClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('CART_SERVICE_URL') || 'http://localhost:3000';
  }

  async getCartById(cartId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/cart/${cartId}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  async getUserCart(userId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/cart/user/${userId}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user cart:', error);
      throw error;
    }
  }

  async clearCart(cartId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/cart/${cartId}/clear`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  async validateCartItems(cartId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/cart/${cartId}/validate`, {}, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error validating cart items:', error);
      throw error;
    }
  }
}
