import { ExtendedWebSocketServer } from '../../shared/interfaces';
import { Server } from 'http';

export const initWebSocket = (server: Server) => {
    const WSS = new ExtendedWebSocketServer({ server });
    return WSS;
}
