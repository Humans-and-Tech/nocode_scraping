
import express from 'express';
import http from 'http';
import { Socket, Server } from "socket.io";

// import { DataSelector } from './interfaces/spider'
// import { IScrapingRequest, ScrapingResponse } from './interfaces/events';
// import { User } from './interfaces/auth';
// import { Spider } from './interfaces/spider';
// import { validateSelector } from './routes/scraping/selector';
// import { updateSpider, getSpider } from './database';




const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    allowedHeaders: ["gus"],
    credentials: false
  }
});

const { getContent, validateSelector } = require("./routes/scraping")(io);
const { getSpider, updateSpider } = require("./routes/spiders")(io);


/**
 * all the socketio routes are listed here
 * and redirected to the correct handler
 * 
 * @param socket 
 */
const onConnection = (socket: Socket) => {

  socket.on("spider:get", getSpider);
  socket.on("spider:upsert", updateSpider);

  socket.on("scraping:get-content", getContent);
  socket.on("scraping:validate-css-selector", validateSelector);

}

io.on("connection", onConnection);

io.on("connect_error", (err: unknown) => {
  console.error(`connect_error due to ${err}`);
});


/**
 * all the socket events are listed here
 * kind of "routes" in similarity to a REST API
 */
// io.on('connection', (socket: Socket) => {

/**
 * user just connected
 */
// socket.emit('connection', {
//   "id": socket.id
// });

////////////////////
///// user actions
////////////////////

////////////////////
///// config actions
////////////////////

/**
 * read the config from the DB
 */
// socket.on('get-spider', (name: string, user: User, callback: (data: Spider | undefined) => void) => {

//   getSpider(user, name).then((data: Spider | undefined) => {
//     console.log("data found", data);
//     callback(data);
//   }).catch((err) => {
//     console.log(err);
//   });

// });

/**
 * persist the spider config
 */
// socket.on('save-spider', (user: User, data: Spider, callback: (b: boolean) => void) => {

//   updateSpider(user, data).then((b: boolean) => {
//     console.log("data saved", b);
//     callback(true);
//   }).catch((err) => {
//     callback(false);
//   });

// });

////////////////////
///// scraping actions
////////////////////

/**
 * fetch the content of a CSS selector node
 *  used by the frontend to evaluate a selector
 */
// socket.on('get-content', (request: IScrapingRequest, callback: (response: ScrapingResponse) => void) => {
//   getContent(request, request.cookie_path).then((response: ScrapingResponse) => {
//     console.log("scraping success: ", response);
//     callback(response);
//   }).catch((response) => {
//     console.log("scraping failure: ", response);
//     callback(response);
//   });

// });

/**
 * validate a CSS selector
 */
// socket.on('validate-css-selector', (selector: DataSelector, callback: (isValid: boolean) => void) => {
//   validateSelector(
//     selector
//   ).then((b: boolean | null) => {
//     if (b !== null) {
//       callback(b);
//     }
//     else {
//       console.error("unable to return the result of validateSelector, return result is null; assuming false");
//       callback(false);
//     }
//   }).catch((e) => {
//     console.error("Error validaing CSS ", selector, e);
//     callback(false);
//   })
// });

// });


server.listen(3001, () => {
  console.info('listening on *:3001');
});