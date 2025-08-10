import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VendorsClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('VENDORS_SERVICE_URL') || 'http://localhost:3000';
  }

  async getVendor(id: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/vendors/${id}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  }

  async getVendors(ids?: string[], auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const url = ids ? `${this.baseUrl}/vendors/bulk` : `${this.baseUrl}/vendors`;
      const data = ids ? { ids } : undefined;
      
      const response = await firstValueFrom(
        ids 
          ? this.httpService.post(url, data, { headers })
          : this.httpService.get(url, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  async getVendorByUserId(userId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/vendors/user/${userId}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor by user ID:', error);
      throw error;
    }
  }

  async updateVendorStats(vendorId: string, statsUpdate: any, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/vendors/${vendorId}/stats`, 
          statsUpdate, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error updating vendor stats:', error);
      throw error;
    }
  }

  async findOne(id: string, auth?: any) {
    return this.getVendor(id, auth);
  }

  async addProductToVendor(vendorId: string, productId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/vendors/${vendorId}/products`, 
          { productId }, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error adding product to vendor:', error);
      throw error;
    }
  }

  async removeProductFromVendor(vendorId: string, productId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/vendors/${vendorId}/products/${productId}`, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error removing product from vendor:', error);
      throw error;
    }
  }
}
