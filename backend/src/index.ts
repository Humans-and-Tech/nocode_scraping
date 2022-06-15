
import express from 'express';
import http from 'http';
import { Socket, Server } from "socket.io";

import { ScrapingElement, Selector } from './interfaces';
import { getSelector } from './scraping'

const app = express();
const server = http.createServer(app);

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

/**
 * all the socket events are listed here
 * kind of "routes" in similarity to a REST API
 */
io.on('connection', (socket: Socket) => {

  /**
   * user just connected
   */
  socket.emit('connection', {
    "id": socket.id
  });

  /**
   * user changed website config
   */
  socket.on('set-website', (data) => {
    console.info("new website config", data);
  });

  /**
   * user changed proxy config
   */
  socket.on('set-proxy', (data) => {
    console.info("new proxy config", data);
  });

  /**
   * receive a scraping element (a selector path)
   * save it
   */
  socket.on('set-scraping-element', (data: ScrapingElement) => {
    console.info("new scraping element to save", data);
  });

  /**
   * the client requests a selector proposal
   */
  socket.on('propose-selector', (url: string, selector: Selector, callback: (selector: Selector) => void) => {
    getSelector(url).then((path: string | undefined) => {
      console.log("new proposal for ", selector, path);
      selector.path = path;
      callback(selector);
    })
  });

});


server.listen(3001, () => {
  console.info('listening on *:3001');
});