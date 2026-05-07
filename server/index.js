const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const { randomBytes } = require('crypto');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// rooms: Map<roomId, { hostWs, viewers: Set<WebSocket>, state: object|null }>
const rooms = new Map();

app.post('/api/rooms', (req, res) => {
  const roomId = randomBytes(4).toString('hex');
  rooms.set(roomId, { hostWs: null, viewers: new Set(), state: null });
  setTimeout(() => rooms.delete(roomId), 24 * 60 * 60 * 1000);
  res.json({ roomId });
});

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Heartbeat: detect dead connections every 30s
const HEARTBEAT_MS = 30_000;
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); return; }
    ws.isAlive = false;
    ws.ping();
  }
}, HEARTBEAT_MS);

wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  const url = new URL(req.url, 'http://localhost');
  const roomId = url.searchParams.get('room');
  const role = url.searchParams.get('role');

  if (!roomId || !rooms.has(roomId)) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
    ws.close(4004, 'Room not found');
    return;
  }

  const room = rooms.get(roomId);

  if (role === 'host') {
    if (room.hostWs) room.hostWs.close();
    room.hostWs = ws;

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'state') {
          room.state = msg.payload;
          for (const viewer of room.viewers) {
            if (viewer.readyState === 1) {
              viewer.send(JSON.stringify({ type: 'state', payload: room.state }));
            }
          }
        }
      } catch (_) {}
    });

    ws.on('close', () => {
      if (room.hostWs === ws) {
        room.hostWs = null;
        for (const viewer of room.viewers) {
          if (viewer.readyState === 1) {
            viewer.send(JSON.stringify({ type: 'host_disconnected' }));
          }
        }
      }
    });
  } else {
    room.viewers.add(ws);

    if (room.state) {
      ws.send(JSON.stringify({ type: 'state', payload: room.state }));
    } else {
      ws.send(JSON.stringify({ type: 'waiting' }));
    }

    ws.on('close', () => room.viewers.delete(ws));
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
