import { ConfigService } from '@nestjs/config';

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export class EnvValidator {
  constructor(private configService: ConfigService) {}

  validateRequiredEnvs(requiredEnvs: string[]): EnvValidationResult {
    const missing: string[] = [];
    const warnings: string[] = [];

    for (const envVar of requiredEnvs) {
      const value = this.configService.get<string>(envVar);
      if (!value) {
        missing.push(envVar);
      }
    }

    // Log environment status (without values for security)
    console.log(`Environment validation summary:`);
    console.log(`- Required variables checked: ${requiredEnvs.length}`);
    console.log(`- Missing variables: ${missing.length}`);
    console.log(`- MongoDB URI: ${this.configService.get('MONGODB_URI') ? 'Configured' : 'Missing'}`);
    console.log(`- JWT Secret: ${this.configService.get('JWT_SECRET') ? 'Configured' : 'Missing'}`);
    console.log(`- Node Environment: ${this.configService.get('NODE_ENV', 'production')}`);
    console.log(`- Log Level: ${this.configService.get('LOG_LEVEL', 'info')}`);

    if (missing.length > 0) {
      console.error(`Missing required environment variables: ${missing.join(', ')}`);
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return {
      valid: missing.length === 0,
      missing,
      warnings,
    };
  }

  logServiceConfiguration(serviceName: string, clientUrls: Record<string, string | undefined>) {
    console.log(`${serviceName} service configuration:`);
    Object.entries(clientUrls).forEach(([service, url]) => {
      console.log(`- ${service}: ${url ? 'Configured' : 'Not configured'}`);
    });
  }
}
