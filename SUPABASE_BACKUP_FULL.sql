-- ==========================================
-- AUTOBID - BACKUP COMPLETO DA ESTRUTURA
-- ==========================================

-- 1. TABELAS PRINCIPAIS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  document_id TEXT,
  phone TEXT,
  zip_code TEXT,
  address TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  role TEXT DEFAULT 'user',
  kyc_status TEXT DEFAULT 'pending',
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  lot_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  mileage_km INTEGER,
  transmission TEXT,
  fuel_type TEXT,
  start_bid NUMERIC NOT NULL,
  current_bid NUMERIC,
  bid_increment NUMERIC DEFAULT 500,
  description TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'active',
  winner_id UUID REFERENCES public.profiles(id),
  final_price NUMERIC,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  is_weekly_highlight BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lot_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lot_id)
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  platform_name TEXT DEFAULT 'AutoBid Leilões',
  support_email TEXT,
  support_phone TEXT,
  buyer_fee NUMERIC DEFAULT 5,
  anti_sniping_time INTEGER DEFAULT 30,
  min_increment NUMERIC DEFAULT 500,
  maintenance_mode BOOLEAN DEFAULT false,
  require_kyc BOOLEAN DEFAULT true,
  chat_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  theme_color TEXT DEFAULT 'orange',
  logo_url TEXT,
  banner_url TEXT,
  banner_link TEXT,
  banner_active BOOLEAN DEFAULT false,
  auctioneer_name TEXT,
  auctioneer_registry TEXT,
  company_cnpj TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- Pode ser UUID de profile ou UUID gerado para visitante
  message TEXT NOT NULL,
  is_from_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lot_payments (
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (lot_id, user_id)
);

-- 2. HABILITAR RLS (SEGURANÇA)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_payments ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACESSO (EXEMPLOS PRINCIPAIS)
CREATE POLICY "Perfis são visíveis por todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários editam próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Leilões visíveis por todos" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Lotes visíveis por todos" ON public.lots FOR SELECT USING (true);
CREATE POLICY "Lances visíveis por todos" ON public.bids FOR SELECT USING (true);

CREATE POLICY "Usuários veem próprias notificações" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam próprias notificações" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Configurações visíveis por todos" ON public.platform_settings FOR SELECT USING (true);

-- 4. FUNÇÕES ESPECIAIS
CREATE OR REPLACE FUNCTION public.get_user_wins(p_user uuid)
 RETURNS TABLE(id uuid, lot_number integer, title text, ends_at timestamp with time zone, final_price numeric, cover_image_url text, status text)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.lot_number,
    l.title,
    l.ends_at,
    COALESCE(l.final_price, l.current_bid) AS final_price,
    l.cover_image_url,
    l.status
  FROM public.lots l
  WHERE (l.status = 'finished')
    AND l.winner_id = p_user;
END;
$function$;

-- 5. TRIGGER PARA CRIAR PERFIL AUTOMÁTICO NO SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. INSERIR CONFIGURAÇÃO INICIAL
INSERT INTO public.platform_settings (id, platform_name) VALUES (1, 'AutoBid Leilões') ON CONFLICT DO NOTHING;