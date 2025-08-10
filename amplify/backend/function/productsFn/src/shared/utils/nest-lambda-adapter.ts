import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import serverless from '@vendia/serverless-express';
import express from 'express';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

export interface BootstrapOptions {
  module: any;
  globalPrefix?: string;
  enableCors?: boolean;
  corsOptions?: any;
}

let cached: any;

export async function createNestLambdaHandler(options: BootstrapOptions) {
  return async (event: any, context: any) => {
    if (!cached) {
      const app = await NestFactory.create(
        options.module,
        new ExpressAdapter(express()),
        { logger: ['error', 'warn', 'log'] }
      );

      // Set global prefix if provided
      if (options.globalPrefix) {
        app.setGlobalPrefix(options.globalPrefix);
      }

      // Global pipes, filters, and guards
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }));

      app.useGlobalFilters(new HttpExceptionFilter());

      // Enable CORS
      if (options.enableCors !== false) {
        app.enableCors(options.corsOptions || {
          origin: true,
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization'],
        });
      }

      await app.init();

      // Create serverless handler
      cached = serverless({ 
        app: (app as any).getHttpAdapter().getInstance(),
      });
    }

    return cached(event, context);
  };
}


