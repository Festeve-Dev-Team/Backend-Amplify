import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentRecordsClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('PAYMENT_RECORDS_SERVICE_URL') || 'http://localhost:3000';
  }

  async createPaymentRecord(paymentData: any, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/payment-records`, paymentData, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }
  }

  async getPaymentRecord(id: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/payment-records/${id}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment record:', error);
      throw error;
    }
  }

  async getByOrderId(orderId: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/payment-records/order/${orderId}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment records by order:', error);
      throw error;
    }
  }

  async updatePaymentStatus(id: string, status: string, auth?: any) {
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/payment-records/${id}/status`, 
          { status }, 
          { headers }
        )
      );
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
}
