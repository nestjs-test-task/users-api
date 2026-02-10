import { NestFactory } from '@nestjs/core';
import { VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { setupValidation } from './config/validation.config';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const isProduction = configService.get('NODE_ENV') === 'production';
  const port = configService.get<number>('APP_PORT', 3000);

  app.useLogger(
    isProduction
      ? ['error', 'warn']
      : ['log', 'debug', 'verbose', 'warn', 'error'],
  );

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(setupValidation());

  if (!isProduction) {
    setupSwagger(app);
    logger.log(`Swagger UI: http://localhost:${port}/docs`);
  }

  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error('Application failed to start', error);
  process.exit(1);
});
