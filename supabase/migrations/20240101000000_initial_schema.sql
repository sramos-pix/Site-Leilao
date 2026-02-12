-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  document_id TEXT,
  address JSONB,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER VERIFICATIONS
CREATE TABLE user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  doc_front_url TEXT,
  doc_back_url TEXT,
  selfie_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUCTIONS
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'live', 'ended', 'cancelled')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  buyer_fee_percent NUMERIC DEFAULT 5,
  requires_deposit BOOLEAN DEFAULT false,
  deposit_amount NUMERIC DEFAULT 0,
  min_increment_default NUMERIC DEFAULT 200,
  anti_sniping_enabled BOOLEAN DEFAULT true,
  anti_sniping_extend_seconds INT DEFAULT 120,
  anti_sniping_max_extensions INT DEFAULT 10,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LOTS
CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  lot_number INT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'live', 'ended', 'sold', 'unsold', 'withdrawn')),
  title TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  version TEXT,
  year INT,
  mileage_km INT,
  fuel TEXT,
  transmission TEXT,
  color TEXT,
  city TEXT,
  state TEXT,
  plate_masked TEXT,
  vin_masked TEXT,
  condition_notes TEXT,
  reserve_price NUMERIC,
  start_bid NUMERIC NOT NULL,
  min_increment NUMERIC,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  extensions_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LOT IMAGES
CREATE TABLE lot_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BIDS
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bids_lot_created ON bids(lot_id, created_at DESC);
CREATE INDEX idx_bids_lot_amount ON bids(lot_id, amount DESC);

-- 7. PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  auction_id UUID REFERENCES auctions(id),
  lot_id UUID REFERENCES lots(id),
  type TEXT CHECK (type IN ('deposit', 'buyer_fee', 'full_payment')),
  stripe_payment_intent_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WINNERS
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID UNIQUE REFERENCES lots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  winning_bid_id UUID REFERENCES bids(id),
  final_amount NUMERIC NOT NULL,
  buyer_fee_amount NUMERIC NOT NULL,
  total_due NUMERIC NOT NULL,
  payment_deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FAVORITES
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lot_id)
);

-- 10. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES profiles(id),
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auctions
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auctions are viewable by everyone" ON auctions FOR SELECT USING (true);
CREATE POLICY "Admins can manage auctions" ON auctions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lots
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lots are viewable by everyone" ON lots FOR SELECT USING (true);
CREATE POLICY "Admins can manage lots" ON lots FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bids
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bids are viewable by everyone" ON bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can place bids" ON bids FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_blocked = true)
);

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Winners
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wins" ON winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wins" ON winners FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
