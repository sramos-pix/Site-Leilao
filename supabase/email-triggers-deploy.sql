-- AutoBid BR — Triggers de Email (versão com valores hardcoded)
-- Gerado automaticamente para deploy direto no SQL Editor

-- URL e chave da Edge Function (anon key funciona pois a função usa --no-verify-jwt)
-- Para mais segurança, substitua v_service_key pela service_role key

-- ──────────────────────────────────────────────
-- 1. TRIGGER: Boas-vindas após cadastro (profiles INSERT)
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_email_welcome()
RETURNS TRIGGER AS $$
DECLARE
  v_function_url TEXT := 'https://tedinonjoqlhmuclyrfg.supabase.co/functions/v1/send-email';
  v_service_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGlub25qb3FsaG11Y2x5cmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzY1NjMsImV4cCI6MjA4NjUxMjU2M30.ryrZCH-SxSe9Cx0gTbs747n9YTw2_vSUh-uMmj4efxg';
BEGIN
  PERFORM net.http_post(
    url := v_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body := jsonb_build_object(
      'type', 'welcome',
      'to', NEW.email,
      'payload', jsonb_build_object(
        'name', COALESCE(NEW.full_name, 'Usuário')
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER email_welcome_on_signup
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_email_welcome();

-- ──────────────────────────────────────────────
-- 2. TRIGGER: Documentos aprovados (profiles UPDATE)
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_email_docs_approved()
RETURNS TRIGGER AS $$
DECLARE
  v_function_url TEXT := 'https://tedinonjoqlhmuclyrfg.supabase.co/functions/v1/send-email';
  v_service_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGlub25qb3FsaG11Y2x5cmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzY1NjMsImV4cCI6MjA4NjUxMjU2M30.ryrZCH-SxSe9Cx0gTbs747n9YTw2_vSUh-uMmj4efxg';
BEGIN
  IF (OLD.kyc_status IS DISTINCT FROM 'approved') AND (NEW.kyc_status = 'approved') THEN
    PERFORM net.http_post(
      url := v_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'type', 'docs-approved',
        'to', NEW.email,
        'payload', jsonb_build_object(
          'name', COALESCE(NEW.full_name, 'Usuário')
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER email_docs_approved_on_update
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_email_docs_approved();

-- ──────────────────────────────────────────────
-- 3. TRIGGER: Lance confirmado (bids INSERT)
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_email_bid_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  v_function_url TEXT := 'https://tedinonjoqlhmuclyrfg.supabase.co/functions/v1/send-email';
  v_service_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGlub25qb3FsaG11Y2x5cmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzY1NjMsImV4cCI6MjA4NjUxMjU2M30.ryrZCH-SxSe9Cx0gTbs747n9YTw2_vSUh-uMmj4efxg';
  v_user_email TEXT;
  v_user_name TEXT;
  v_lot_title TEXT;
  v_prev_high_bidder_id UUID;
  v_prev_high_bidder_email TEXT;
  v_prev_high_bidder_name TEXT;
  v_prev_high_bid NUMERIC;
BEGIN
  SELECT p.email, p.full_name
  INTO v_user_email, v_user_name
  FROM profiles p
  WHERE p.id = NEW.user_id;

  SELECT l.title
  INTO v_lot_title
  FROM lots l
  WHERE l.id = NEW.lot_id;

  IF NOT COALESCE(NEW.is_auto, false) THEN
    PERFORM net.http_post(
      url := v_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'type', 'bid-confirmed',
        'to', v_user_email,
        'payload', jsonb_build_object(
          'name', COALESCE(v_user_name, 'Usuário'),
          'vehicleName', COALESCE(v_lot_title, 'Veículo'),
          'amount', NEW.amount,
          'lotId', NEW.lot_id::text
        )
      )
    );
  END IF;

  SELECT b.user_id, p.email, p.full_name, b.amount
  INTO v_prev_high_bidder_id, v_prev_high_bidder_email, v_prev_high_bidder_name, v_prev_high_bid
  FROM bids b
  JOIN profiles p ON p.id = b.user_id
  WHERE b.lot_id = NEW.lot_id
    AND b.user_id != NEW.user_id
    AND b.id != NEW.id
  ORDER BY b.amount DESC
  LIMIT 1;

  IF v_prev_high_bidder_id IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'type', 'bid-outbid',
        'to', v_prev_high_bidder_email,
        'payload', jsonb_build_object(
          'name', COALESCE(v_prev_high_bidder_name, 'Usuário'),
          'vehicleName', COALESCE(v_lot_title, 'Veículo'),
          'yourAmount', v_prev_high_bid,
          'newAmount', NEW.amount,
          'lotId', NEW.lot_id::text
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER email_bid_confirmed_on_insert
AFTER INSERT ON bids
FOR EACH ROW
EXECUTE FUNCTION trigger_email_bid_confirmed();

-- ──────────────────────────────────────────────
-- 4. TRIGGER: Lote finalizado — notifica vencedor (lots UPDATE)
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_email_auction_won()
RETURNS TRIGGER AS $$
DECLARE
  v_function_url TEXT := 'https://tedinonjoqlhmuclyrfg.supabase.co/functions/v1/send-email';
  v_service_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGlub25qb3FsaG11Y2x5cmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzY1NjMsImV4cCI6MjA4NjUxMjU2M30.ryrZCH-SxSe9Cx0gTbs747n9YTw2_vSUh-uMmj4efxg';
  v_winner_email TEXT;
  v_winner_name TEXT;
BEGIN
  IF (OLD.status IS DISTINCT FROM 'finished') AND (NEW.status = 'finished') AND (NEW.winner_id IS NOT NULL) THEN
    SELECT p.email, p.full_name
    INTO v_winner_email, v_winner_name
    FROM profiles p
    WHERE p.id = NEW.winner_id;

    PERFORM net.http_post(
      url := v_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'type', 'auction-won',
        'to', v_winner_email,
        'payload', jsonb_build_object(
          'name', COALESCE(v_winner_name, 'Usuário'),
          'vehicleName', NEW.title,
          'finalAmount', COALESCE(NEW.final_price, NEW.current_bid),
          'lotId', NEW.id::text
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER email_auction_won_on_finish
AFTER UPDATE ON lots
FOR EACH ROW
EXECUTE FUNCTION trigger_email_auction_won();
