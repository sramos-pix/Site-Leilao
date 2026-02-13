import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminService {
  static async createAuction(data: any) {
    return await prisma.auction.create({ data });
  }

  static async listAuctions() {
    return await prisma.auction.findMany({
      include: { _count: { select: { lots: true } } },
      orderBy: { startsAt: 'desc' }
    });
  }

  static async createLot(data: any) {
    return await prisma.lot.create({
      data: {
        ...data,
        currentBid: data.startBid
      }
    });
  }

  static async listLotsByAuction(auctionId: string) {
    return await prisma.lot.findMany({
      where: { auctionId },
      orderBy: { lotNumber: 'asc' }
    });
  }

  static async deleteLot(lotId: string) {
    return await prisma.lot.delete({ where: { id: lotId } });
  }
}