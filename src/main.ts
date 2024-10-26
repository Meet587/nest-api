import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('NestJs API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('NestJs API');

  const document = SwaggerModule.createDocument(app, options.build());
  SwaggerModule.setup('api-docs', app, document);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
