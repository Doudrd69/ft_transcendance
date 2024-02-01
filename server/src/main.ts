import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io'
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common'
import dotenv from 'dotenv';

dotenv.config();

const express = require('express');
const cors = require('cors');

// Configure CORS to allow requests from http://localhost:3000 and prod computer
const corsOptions = {
  origin: [`${process.env.SERVER_REDIRECT_URI}`, 'http://localhost:3000'],
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,  // Enable CORS with credentials (e.g., cookies)
};

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	app.use(cors(corsOptions));

	// const httpAdapter = app.getHttpAdapter();
	// app.useWebSocketAdapter(new IoAdapter(httpAdapter));

	await app.listen(3001);
}

bootstrap();
