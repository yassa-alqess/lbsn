import WebSocket, { Server as WebSocketServer } from 'ws';
import logger from '../logger';

class CustomWebSocketServer extends WebSocketServer {
    public broadcast(data: string) {
        this.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}


const wss = new CustomWebSocketServer({ port: 8080 });

wss.on('connection', () => {
    logger.info('New client connected');
});

wss.on('close', () => {
    logger.info('Client disconnected');
});

export default wss;
