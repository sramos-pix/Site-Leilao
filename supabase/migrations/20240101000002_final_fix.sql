-- 1. Limpeza (Cuidado: isso apaga dados existentes nas tabelas abaixo)
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS lots;
DROP TABLE IF EXISTS auctions;
DROP TABLE IF EXISTS profiles;

-- 2. Criação das Tabelas
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE auctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  buyer_fee_percent DECIMAL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  lot_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  mileage_km INTEGER,
  start_bid DECIMAL NOT NULL,
  current_bid DECIMAL,
  min_increment DECIMAL DEFAULT 500,
  condition_notes TEXT,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Desabilitar RLS para facilitar o desenvolvimento inicial
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE auctions DISABLE ROW LEVEL SECURITY;
ALTER TABLE lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;

-- 4. Permissões de acesso
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;