import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './server/socket';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const nextPort = 3000;
const socketPort = 3001;


async function startServer() {
  const app = next({ dev, hostname, port: nextPort });
  const handle = app.getRequestHandler();

  try {
    await app.prepare();

    // Create Next.js server
    const nextServer = createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    nextServer.listen(nextPort, () => {
      console.log(`> Next.js app ready on http://${hostname}:${nextPort}`);
    });

    // Create Socket.IO server
    const socketServer = createServer();
    // const io = initSocketServer(socketServer);

    socketServer.on('error', (err) => {
      console.error('Socket server error:', err);
    });

    socketServer.listen(socketPort, () => {
      console.log(`> Socket.IO server ready on http://${hostname}:${socketPort}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});