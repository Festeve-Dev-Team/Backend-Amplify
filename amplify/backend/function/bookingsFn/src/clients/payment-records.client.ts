import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentRecordsClient {
  private baseUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('PAYMENT_RECORDS_SERVICE_URL', '');
  }

  async createPaymentRecord(paymentData: any, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/payment-records`, paymentData, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Payment Records service error:', error);
      return null;
    }
  }

  async getPaymentRecord(id: string, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/payment-records/${id}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Payment Records service error:', error);
      return null;
    }
  }

  async getByBookingId(bookingId: string, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/payment-records/booking/${bookingId}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Payment Records service error:', error);
      return null;
    }
  }
}
