import { Router, Response, Request } from 'express';
import { BidService } from '../services/bid.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { placeBidSchema } from '../validations/bid.schema';

const router = Router();

router.post('/', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const validatedData = placeBidSchema.parse(authReq.body);
    const bid = await BidService.placeBid(
      authReq.user!.id,
      validatedData.lotId,
      validatedData.amount
    );
    return res.status(201).json(bid);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
});

export default router;