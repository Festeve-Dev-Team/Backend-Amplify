import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductsClient {
  private baseUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('PRODUCTS_SERVICE_URL', '');
  }

  async getProduct(id: string, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/products/${id}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Products service error:', error);
      return null;
    }
  }

  async getProducts(query?: any, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/products`, { 
          headers,
          params: query 
        })
      );
      return response.data;
    } catch (error) {
      console.error('Products service error:', error);
      return null;
    }
  }

  async checkProductAvailability(productId: string, quantity: number, auth?: string) {
    if (!this.baseUrl) return null;
    
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
      console.error('Products service error:', error);
      return null;
    }
  }
}
