import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EventsClient {
  private baseUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('EVENTS_SERVICE_URL', '');
  }

  async getEvent(id: string, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/events/${id}`, { headers })
      );
      return response.data;
    } catch (error) {
      console.error('Events service error:', error);
      return null;
    }
  }

  async getEvents(query?: any, auth?: string) {
    if (!this.baseUrl) return null;
    
    try {
      const headers = auth ? { Authorization: auth } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/events`, { 
          headers,
          params: query 
        })
      );
      return response.data;
    } catch (error) {
      console.error('Events service error:', error);
      return null;
    }
  }
}
