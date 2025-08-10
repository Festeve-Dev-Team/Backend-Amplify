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
    this.baseUrl = this.configService.get<string>('PRODUCTS_SERVICE_URL') || 'http://localhost:3000';
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

  async getProducts(query?: any, auth?: any) {
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
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductsByVendor(vendorId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/products/vendor/${vendorId}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching products by vendor:', error);
      throw error;
    }
  }

  async getProductStats(vendorId?: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const url = vendorId 
        ? `${this.baseUrl}/products/stats/vendor/${vendorId}`
        : `${this.baseUrl}/products/stats`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }
  }

  async findOne(id: string, auth?: any) {
    return this.getProduct(id, auth);
  }

  async addVendors(productId: string, vendorIds: string[], auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/products/${productId}/vendors`, 
          { vendorIds }, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error adding vendors to product:', error);
      throw error;
    }
  }

  async removeVendors(productId: string, vendorIds: string[], auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/products/${productId}/vendors`, 
          { 
            headers,
            data: { vendorIds }
          }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error removing vendors from product:', error);
      throw error;
    }
  }
}
