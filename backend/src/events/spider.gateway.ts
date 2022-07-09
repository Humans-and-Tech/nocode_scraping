import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
const config = require('config');

@WebSocketGateway({
  namespace: 'spider'
})
export class SpiderEventGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server;

  async handleConnection() {
    // A client has connected
    console.log("connected");
  }

  async handleDisconnect() {
    console.log("disconnected");
  }

  @SubscribeMessage('get')
  async onGet(client, message) {
    console.log("get spider", message);
  }
}