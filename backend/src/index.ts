import express from 'express';
import http from 'http';
import { Socket, Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    allowedHeaders: ['gus'],
    credentials: false
  }
});

const { scrapeContent, isSelectorValid } = require('./socket/scraping')(io);
const { getSpider, updateSpider } = require('./socket/spider')(io);

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
  console.error(`connect_error due to ${err}`);
});

server.listen(3001, () => {
  console.info('listening on *:3001');
});
