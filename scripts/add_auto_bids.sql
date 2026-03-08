-- ============================================================
-- LANCE AUTOMÁTICO — Migração SQL
-- AutoBid BR | Versão 1.0 | 08/03/2026
-- ============================================================
-- Execute este script no painel SQL do Supabase:
-- Dashboard > SQL Editor > New Query > Cole e Execute
-- ============================================================

-- 1. Adiciona coluna is_auto na tabela bids
ALTER TABLE public.bids
  ADD COLUMN IF NOT EXISTS is_auto BOOLEAN DEFAULT false;

-- 2. Cria a tabela auto_bids
CREATE TABLE IF NOT EXISTS public.auto_bids (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id       UUID        NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_amount   NUMERIC     NOT NULL,
  is_active    BOOLEAN     DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lot_id, user_id)
);

-- 3. Habilita RLS na tabela auto_bids
ALTER TABLE public.auto_bids ENABLE ROW LEVEL SECURITY;

-- 4. Política de acesso: usuário só vê e gerencia seus próprios auto_bids
DROP POLICY IF EXISTS "Users manage own auto_bids" ON public.auto_bids;
CREATE POLICY "Users manage own auto_bids"
  ON public.auto_bids FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Função do trigger de lance automático
CREATE OR REPLACE FUNCTION public.handle_auto_bid()
RETURNS TRIGGER AS $$
DECLARE
  v_increment          NUMERIC;
  v_lot_ends_at        TIMESTAMPTZ;
  v_lot_force_finished BOOLEAN;
  v_auto_bid           RECORD;
  v_new_bid_amount     NUMERIC;
BEGIN
  -- Guard: ignora se já é um lance automático (evita recursão infinita)
  IF NEW.is_auto = true THEN
    RETURN NEW;
  END IF;

  -- Busca dados do lote
  SELECT bid_increment, ends_at, COALESCE(force_finished, false)
    INTO v_increment, v_lot_ends_at, v_lot_force_finished
    FROM public.lots
   WHERE id = NEW.lot_id;

  -- Ignora se o leilão já encerrou
  IF v_lot_force_finished = true
     OR (v_lot_ends_at IS NOT NULL AND v_lot_ends_at < NOW()) THEN
    RETURN NEW;
  END IF;

  v_increment      := COALESCE(v_increment, 500);
  v_new_bid_amount := NEW.amount + v_increment;

  -- Busca o auto_bid concorrente com maior limite que ainda consegue superar o lance atual
  SELECT * INTO v_auto_bid
    FROM public.auto_bids
   WHERE lot_id   = NEW.lot_id
     AND user_id  != NEW.user_id
     AND is_active = true
     AND max_amount >= v_new_bid_amount
   ORDER BY max_amount DESC, created_at ASC
   LIMIT 1;

  -- Nenhum concorrente capaz de responder: desativa os que não conseguem mais vencer
  IF v_auto_bid IS NULL THEN
    UPDATE public.auto_bids
       SET is_active = false
     WHERE lot_id   = NEW.lot_id
       AND user_id  != NEW.user_id
       AND is_active = true
       AND max_amount < v_new_bid_amount;
    RETURN NEW;
  END IF;

  -- Insere o contra-lance automático
  INSERT INTO public.bids (lot_id, user_id, amount, is_auto)
  VALUES (NEW.lot_id, v_auto_bid.user_id, v_new_bid_amount, true);

  -- Atualiza o valor atual do lote
  UPDATE public.lots
     SET current_bid = v_new_bid_amount
   WHERE id = NEW.lot_id;

  -- Desativa o auto_bid se atingiu o limite máximo
  IF v_new_bid_amount >= v_auto_bid.max_amount THEN
    UPDATE public.auto_bids
       SET is_active = false
     WHERE id = v_auto_bid.id;
  END IF;

  -- Notifica quem foi superado
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    'Você foi superado!',
    'Seu lance foi superado por um lance automático. Dê um novo lance para continuar disputando.',
    'bid_outbid'
  );

  -- Notifica o dono do auto_bid que seu sistema agiu
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_auto_bid.user_id,
    'Lance automático realizado!',
    'Seu lance automático foi acionado com sucesso. Você está vencendo o leilão.',
    'auto_bid_fired'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Cria o trigger (remove o antigo se existir)
DROP TRIGGER IF EXISTS on_bid_auto_bid ON public.bids;
CREATE TRIGGER on_bid_auto_bid
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auto_bid();

-- ============================================================
-- Confirmação de execução:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name = 'auto_bids';
-- ============================================================
