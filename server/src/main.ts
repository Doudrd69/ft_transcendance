import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io' 

const express = require('express');
const cors = require('cors');

// Configure CORS to allow requests from http://localhost:3000
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,  // Enable CORS with credentials (e.g., cookies)
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cors(corsOptions));

  // const httpAdapter = app.getHttpAdapter();
  // app.useWebSocketAdapter(new IoAdapter(httpAdapter));

  await app.listen(3001);
}

bootstrap();
