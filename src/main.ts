import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the React frontend
  app.enableCors({
    origin: '*', // In production, restrict to your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Use Socket.IO adapter for WebSocket support
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(3000);
  console.log('🚀 Kawewo server running on http://localhost:3000');
}
bootstrap();
