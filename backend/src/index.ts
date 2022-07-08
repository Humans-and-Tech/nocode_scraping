import express from 'express';
import http from 'http';
import { Socket, Server } from 'socket.io';
import logger from './logging';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    allowedHeaders: ['gus'],
    credentials: false
  }
});

/* eslint-disable */
const { scrapeContent, isSelectorValid } = require('./socket/scraping')(io);
const { getSpider, updateSpider } = require('./socket/spider')(io);
/* eslint-enable */

/**
 * all the socketio routes are listed here
 * and redirected to the correct handler
 *
 * @param socket
 */
const onConnection = (socket: Socket) => {
  socket.on('spider:get', getSpider);
  socket.on('spider:upsert', updateSpider);

  socket.on('scraping:get-content', scrapeContent);
  socket.on('scraping:validate-css-selector', isSelectorValid);
};

io.on('connection', onConnection);

io.on('connect_error', (err: unknown) => {
  logger.error(`socket.io connect error due to ${err}`);
});

server.listen(3001, () => {
  logger.info('listening on *:3001');
});
