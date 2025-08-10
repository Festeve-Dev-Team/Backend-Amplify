import { ConfigService } from '@nestjs/config';
import { HttpModuleOptions } from '@nestjs/axios';

export const createHttpConfig = (configService: ConfigService): HttpModuleOptions => {
  const timeout = configService.get<number>('REQUEST_TIMEOUT_MS', 8000);
  
  console.log(`HTTP client timeout configured: ${timeout}ms`);
  
  return {
    timeout,
    retries: configService.get<number>('RETRY_COUNT', 3),
    retryDelay: (retryCount) => retryCount * 1000, // 1s, 2s, 3s
    retryCondition: (error) => {
      // Retry on network errors and 5xx responses
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    },
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Festeve-Service/1.0',
    },
  };
};
