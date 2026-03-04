import { Router, Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AdminService } from '../services/admin.service';
import { createAuctionSchema, createLotSchema } from '../validations/admin.schema';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as AuthRequest).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return res.status(403).json({ error: 'Perfil não encontrado.' });
  }

  if (profile.role !== 'admin' && profile.role !== 'finance') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }

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