import WebSocket, { Server as WebSocketServer } from 'ws';

export class ExtendedWebSocketServer extends WebSocketServer {
    public broadcast(data: string) {
        this.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}
