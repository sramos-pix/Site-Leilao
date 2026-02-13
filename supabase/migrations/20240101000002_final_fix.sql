-- 1. Criar Tabela de Leilões
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  buyer_fee_percent NUMERIC DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar Tabela de Lotes (Veículos)
CREATE TABLE IF NOT EXISTS lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  lot_number INTEGER,
  title TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  mileage_km INTEGER,
  start_bid NUMERIC,
  current_bid NUMERIC,
  min_increment NUMERIC DEFAULT 500,
  condition_notes TEXT,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar Tabela de Perfis
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar Políticas de Acesso Público (Para teste inicial)
CREATE POLICY "Permitir leitura pública de leilões" ON auctions FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de lotes" ON lots FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública de leilões (Admin)" ON auctions FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção pública de lotes (Admin)" ON lots FOR INSERT WITH CHECK (true);