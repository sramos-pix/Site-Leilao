import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pino from 'pino';
import dotenv from 'dotenv';

// Importando rotas
import bidRoutes from './routes/bid.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();
const logger = pino({ transport: { target: 'pino-pretty' } });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// Registro de Rotas
app.use('/api/bids', bidRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) => res.send('OK'));

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-auction', (auctionId) => {
    socket.join(`auction:${auctionId}`);
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