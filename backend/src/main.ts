import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

import logger from './logging';

const config = require('config');

logger.info(config);


// adapter for cors with socket.io
// @see https://stackoverflow.com/questions/65957386/cors-error-with-socket-io-connections-on-chrome-v88-and-nestjs-server
class SocketAdapter extends IoAdapter {
  createIOServer(
    port: number,
    options?: ServerOptions & {
      namespace?: string;
      server?: any;
    }
  ) {
    const server = super.createIOServer(port, { ...options, cors: true });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new SocketAdapter(app));
  app.enableCors({
    origin: config.get('server.cors.allowedOrigin'),
    allowedHeaders: config.get('server.cors.allowedHeaders'),
    credentials: false
  });
  await app.listen(config.get('server.port'));
}
bootstrap();
