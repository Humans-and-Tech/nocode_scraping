// import { createContext } from 'react';
// import { io } from 'socket.io-client';

// /**
//  * there is one socket per namespace
//  * see https://socket.io/fr/docs/v4/namespaces/
//  */
// export const spiderSocket = io('localhost:3001/spider', {
//   withCredentials: false,
//   extraHeaders: {
//     gus: 'token'
//   }
// });
// export const scrapingSocket = io('localhost:3001/scraping', {
//   withCredentials: false,
//   extraHeaders: {
//     gus: 'token'
//   }
// });
// export const SpiderSocketContext = createContext(spiderSocket);
// export const ScrapingSocketContext = createContext(scrapingSocket);
