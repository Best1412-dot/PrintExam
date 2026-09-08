import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface ExtendedWebSocket extends WebSocket {
  userId?: number;
  userRole?: string;
  isAlive?: boolean;
}

let wss: WebSocketServer | null = null;

export function initWebSocketServer(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: ExtendedWebSocket, req) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'AUTH') {
          ws.userId = data.userId;
          ws.userRole = data.userRole;
          console.log(`[WebSocket] Client authenticated: User ${ws.userId} (${ws.userRole})`);
        }
      } catch (err) {
        console.error('[WebSocket] Message parsing error:', err);
      }
    });

    ws.on('close', () => {
      // Disconnected
    });
  });

  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((client: WebSocket) => {
      const extWs = client as ExtendedWebSocket;
      if (extWs.isAlive === false) return extWs.terminate();
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('[WebSocket] Server initialized on /ws');
  return wss;
}

export function broadcastEvent(event: string, payload: any, targetUserIds?: number[]): void {
  if (!wss) return;

  const message = JSON.stringify({
    event,
    payload,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      const extWs = client as ExtendedWebSocket;
      if (targetUserIds && targetUserIds.length > 0) {
        if (extWs.userId && targetUserIds.includes(extWs.userId)) {
          extWs.send(message);
        }
      } else {
        extWs.send(message);
      }
    }
  });
}
