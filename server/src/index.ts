import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();
const logger = pino({ transport: { target: 'pino-pretty' } });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" } // Em produção, restringir ao domínio do front
});

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => res.send('OK'));

// WebSocket Logic
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-auction', (auctionId) => {
    socket.join(`auction:${auctionId}`);
    logger.info(`User joined auction room: ${auctionId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server professional running on port ${PORT}`);
});

export { io, logger };