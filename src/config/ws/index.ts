import { ExtendedWebSocketServer } from '../../shared/interfaces';
import { Server } from 'http';
import { Server as SecureServer } from 'https';
export const initWebSocket = (server: Server) => {
    const WSS = new ExtendedWebSocketServer({ server });
    return WSS;
}

export const initSecureWebSocket = (server: SecureServer) => {
    const WSS = new ExtendedWebSocketServer({ server });
    return WSS;
}