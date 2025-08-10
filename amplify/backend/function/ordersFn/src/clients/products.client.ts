import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductsClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('PRODUCTS_SERVICE_URL');
    if (!this.baseUrl) {
      throw new Error('PRODUCTS_SERVICE_URL environment variable is required');
    }
  }

  async getProduct(id: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/products/${id}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async getProducts(ids: string[], auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/products/bulk`, { ids }, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async checkProductAvailability(productId: string, quantity: number, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/products/${productId}/check-availability`, 
          { quantity }, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error checking product availability:', error);
      throw error;
    }
  }

  async updateProductStock(productId: string, quantity: number, operation: 'increment' | 'decrement', auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/products/${productId}/stock`, 
          { quantity, operation }, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }
}
