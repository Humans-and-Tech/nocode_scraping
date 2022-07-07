import { createContext } from 'react';
import { io } from 'socket.io-client';

export const socket = io('localhost:3001', {
  withCredentials: false,
  extraHeaders: {
    gus: 'token'
  }
});
export const SocketContext = createContext(socket);
