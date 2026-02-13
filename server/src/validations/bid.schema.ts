import { z } from 'zod';

export const placeBidSchema = z.object({
  lotId: z.string().uuid('ID do lote inválido'),
  amount: z.number().positive('O valor deve ser positivo'),
});

export type PlaceBidInput = z.infer<typeof placeBidSchema>;