import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('API for ecommerce')
    .setVersion('1.0')
    .addTag('ecommerce')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Refresh-JWT',
        in: 'header',
        description: 'Enter JWT Refresh Token',
      },
      'JWT-refresh',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagSorter: 'alpha',
      operationSorter: 'alpha',
    },
    customSiteTitle: 'Api Documentation',
    customfavIcon: 'https://nest-js.com/img/logo-small.svg',
    customCss: `.swagger-ui .topbar {display:none}
                 .swagger-ui .info {margin: 50px 0;}
                 .swagger-ui .info .title {color:#4A90E2;}`,
  });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? 'http://localhost:3000', // Allow all origins (in production, specify your Next.js app URL)
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
