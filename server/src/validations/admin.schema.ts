import { z } from 'zod';

export const createAuctionSchema = z.object({
  title: z.string().min(5),
  description: z.string(),
  location: z.string(),
  startsAt: z.string().transform((str) => new Date(str)),
  endsAt: z.string().transform((str) => new Date(str)),
  buyerFeePercent: z.number().default(5),
});

export const createLotSchema = z.object({
  auctionId: z.string().uuid(),
  lotNumber: z.number(),
  title: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number().int(),
  mileageKm: z.number(),
  startBid: z.number(),
  minIncrement: z.number().default(500),
  endsAt: z.string().transform((str) => new Date(str)),
});