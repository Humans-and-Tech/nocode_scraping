
import express from 'express';
import http from 'http';
import { Socket, Server } from "socket.io";

import { ScrapingElement, Selector, ScrapingConfig, User } from './interfaces';
import { getContent } from './features/scraping'
import { validateSelector } from './features/configure/selector'
import { updateScrapingConfig, getScrapingConfig } from './database'


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
   * read the config from the DB
   */
  socket.on('get-config', (name: string, user: User, callback: (data: ScrapingConfig | undefined) => void) => {

    // TODO:
    // const org = user.organization;
    // and pass the org to the updateScrapingConfig
    getScrapingConfig({}, name).then((data: ScrapingConfig | undefined) => {
      console.log("data found", data);
      callback(data);
    }).catch((err) => {
      console.log(err);
    });

  });

  /**
   * persist the spider config
   */
  socket.on('save-config', (data: ScrapingConfig, user: User) => {

    // TODO:
    // const org = user.organization;
    // and pass the org to the updateScrapingConfig
    updateScrapingConfig({}, data).then((b: boolean) => {
      console.log("data saved", b);
    }).catch((err) => {
      console.log(err);
    });

  });

  /**
   * fetch the content of a CSS selector node
   *  used by the frontend to evaluate a selector
   */
  socket.on('get-selector-content', (selector: Selector, callback: (content: string | null) => void) => {
    console.info("get-selector-content", selector);
    getContent(selector).then((content: string | null) => {
      callback(content);
    }).catch((e) => {
      console.error("Could not evaluated selector ", e);
      callback(null);
    });

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
    // getSelector(url).then((path: string | undefined) => {
    //   console.log("new proposal for ", selector, path);
    //   // selector.path = path;
    //   callback(selector);
    // })
  });

  /**
   * validate a CSS selector
   */
  socket.on('validate-css-selector', (selector: Selector, callback: (isValid: boolean) => void) => {
    validateSelector(
      selector
    ).then((b: boolean | null) => {
      if (b !== null) {
        callback(b);
      }
      else {
        console.error("unable to return the result of validateSelector, return result is null; assuming false");
        callback(false);
      }
    }).catch((e) => {
      console.error("Error validaing CSS ", selector, e);
      callback(false);
    })
  });

});


server.listen(3001, () => {
  console.info('listening on *:3001');
});