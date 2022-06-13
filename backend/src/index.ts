
// import { ClientToServerEvents } from './interfaces/socket';

import { Socket } from "socket.io";

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    allowedHeaders: ["gus"],
    credentials: false
  }
});

io.on("connect_error", (err: unknown) => {
  console.error(`connect_error due to ${err}`);
});

io.on('connection', (socket: Socket) => {
  // console.debug(socket);
  socket.send('hello', {});
});

io.on('olleh', () => {
  console.info("olleh received");
});


server.listen(3001, () => {
  console.info('listening on *:3001');
});