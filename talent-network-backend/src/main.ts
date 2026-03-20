import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const port = process.env.PORT || 3001;

  if (!process.env.DATABASE_URL) {
    console.warn('Warning: DATABASE_URL is not set');
  }

  if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set');
  }

  if (!process.env.GOOGLE_API_KEY) {
    console.warn('Warning: GOOGLE_API_KEY is not set');
  }

  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip out non-whitelisted params
      transform: true, // auto-transform payloads to be typed instances
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Talent Infrastructure Network API')
    .setDescription(
      'The API documentation for the scalable sponsorship and talent growth platform.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
