import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { logger, io } from '../index';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class BidService {
  static async placeBid(userId: string, lotId: string, amount: number) {
    const lockKey = `lock:lot:${lotId}`;
    const acquired = await redis.set(lockKey, 'locked', 'EX', 5, 'NX');

    if (!acquired) {
      throw new Error('Muitos lances simultâneos. Tente novamente em um segundo.');
    }

    try {
      const lot = await prisma.lot.findUnique({
        where: { id: lotId },
        include: { auction: true }
      });

      if (!lot) throw new Error('Lote não encontrado.');
      if (new Date() > lot.endsAt) throw new Error('Leilão já encerrado.');

      const currentMax = lot.currentBid || lot.startBid;
      if (amount < currentMax + lot.minIncrement) {
        throw new Error(`Lance mínimo exigido: ${currentMax + lot.minIncrement}`);
      }

      const bid = await prisma.$transaction(async (tx) => {
        const newBid = await tx.bid.create({
          data: {
            userId,
            lotId,
            amount,
          }
        });

        await tx.lot.update({
          where: { id: lotId },
          data: { currentBid: amount }
        });

        return newBid;
      });

      io.to(`auction:${lot.auctionId}`).emit('new-bid', {
        lotId,
        amount,
        userId: userId.substring(0, 5) + '***'
      });

      logger.info(`Bid placed: User ${userId} -> Lot ${lotId} (R$ ${amount})`);
      return bid;

    } finally {
      await redis.del(lockKey);
    }
  }
}