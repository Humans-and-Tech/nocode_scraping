// import express from 'express';
// import http from 'http';
// import { Socket, Server } from 'socket.io';
// const config = require('config');

// import logger from './logging';

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: config.get('server.cors.allowedOrigin'),
//     allowedHeaders: config.get('server.cors.allowedHeaders'),
//     credentials: false
//   }
// });

// /* eslint-disable */
// const { scrapeContent, isSelectorValid } = require('./socket/scraping')(io);
// const { getSpider, updateSpider } = require('./socket/spider')(io);
/* eslint-enable */

/**
 * all the socketio routes are listed here
 * and redirected to the correct handler
 *
 * @param socket
 */
// const onConnection = (socket: Socket) => {
//   socket.on('spider:get', getSpider);
//   socket.on('spider:upsert', updateSpider);

//   socket.on('scraping:get-content', scrapeContent);
//   socket.on('scraping:validate-css-selector', isSelectorValid);
// };

// io.on('connection', onConnection);

// io.on('connect_error', (err: unknown) => {
//   logger.error(`socket.io connect error due to ${err}`);
// });

// server.listen(config.get('server.port'), () => {
//   logger.info(`listening on *:${config.get('server.port')}`);
// });
