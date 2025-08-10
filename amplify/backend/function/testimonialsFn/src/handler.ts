import { AppModule } from './app.module';
import { createNestLambdaHandler } from './shared/utils/nest-lambda-adapter';

export const handler = createNestLambdaHandler({
  module: AppModule,
  enableCors: true,
  corsOptions: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

