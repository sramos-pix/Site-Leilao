import { Router, Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { createAuctionSchema, createLotSchema } from '../validations/admin.schema';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Middleware simples para verificar se é admin (em produção, checar campo 'role' no banco)
const isAdmin = (req: Request, res: Response, next: any) => {
  // Por enquanto, validamos apenas se está autenticado. 
  // Em um sistema real, verificaríamos profile.role === 'admin'
  next();
};

router.use(authenticate);
router.use(isAdmin);

// Rotas de Leilão
router.post('/auctions', async (req: Request, res: Response) => {
  try {
    const data = createAuctionSchema.parse(req.body);
    const auction = await AdminService.createAuction(data);
    res.status(201).json(auction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/auctions', async (_req: Request, res: Response) => {
  const auctions = await AdminService.listAuctions();
  res.json(auctions);
});

// Rotas de Lotes (Veículos)
router.post('/lots', async (req: Request, res: Response) => {
  try {
    const data = createLotSchema.parse(req.body);
    const lot = await AdminService.createLot(data);
    res.status(201).json(lot);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/auctions/:id/lots', async (req: Request, res: Response) => {
  const lots = await AdminService.listLotsByAuction(req.params.id);
  res.json(lots);
});

router.delete('/lots/:id', async (req: Request, res: Response) => {
  await AdminService.deleteLot(req.params.id);
  res.status(204).send();
});

export default router;