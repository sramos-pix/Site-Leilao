-- AutoBid BR — Triggers de Email Automatizado
-- Execute no SQL Editor do Supabase após fazer deploy da Edge Function send-email
--
-- REQUISITOS:
--   1. Deploy da Edge Function: npx supabase functions deploy send-email
--   2. Setar segredo:            npx supabase secrets set RESEND_API_KEY=re_xxxxxx
--   3. Extensão pg_net habilitada (já vem no Supabase)
--   4. Extensão pg_cron habilitada: Dashboard → Database → Extensions → pg_cron

-- ──────────────────────────────────────────────
-- VARIÁVEL: URL da Edge Function
-- Substitua pelo ID real do seu projeto Supabase
-- ──────────────────────────────────────────────

-- Para descobrir: Dashboard → Settings → API → Project URL
-- Exemplo: https://tedinonjoqlhmuclyrfg.supabase.co/functions/v1/send-email

-- ──────────────────────────────────────────────
-- 1. TRIGGER: Boas-vindas após cadastro (profiles INSERT)
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_email_welcome()
RETURNS TRIGGER AS $$
DECLARE
  v_function_url TEXT := 'https://' || current_setting('app.supabase_project_id', true) || '.supabase.co/functions/v1/send-email';
  v_service_key TEXT := current_setting('app.supabase_service_key', true);
BEGIN
  -- Dispara email de boas-vindas
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
  v_function_url TEXT := 'https://' || current_setting('app.supabase_project_id', true) || '.supabase.co/functions/v1/send-email';
  v_service_key TEXT := current_setting('app.supabase_service_key', true);
BEGIN
  -- Só dispara quando kyc_status muda de qualquer coisa para 'approved'
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
  v_function_url TEXT := 'https://' || current_setting('app.supabase_project_id', true) || '.supabase.co/functions/v1/send-email';
  v_service_key TEXT := current_setting('app.supabase_service_key', true);
  v_user_email TEXT;
  v_user_name TEXT;
  v_lot_title TEXT;
  v_prev_high_bidder_id UUID;
  v_prev_high_bidder_email TEXT;
  v_prev_high_bidder_name TEXT;
  v_prev_high_bid NUMERIC;
BEGIN
  -- Busca dados do usuário e do lote
  SELECT p.email, p.full_name
  INTO v_user_email, v_user_name
  FROM profiles p
  WHERE p.id = NEW.user_id;

  SELECT l.title
  INTO v_lot_title
  FROM lots l
  WHERE l.id = NEW.lot_id;

  -- Só envia para lances manuais (não auto-bid)
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

  -- Notifica o licitante anterior que foi superado
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
  v_function_url TEXT := 'https://' || current_setting('app.supabase_project_id', true) || '.supabase.co/functions/v1/send-email';
  v_service_key TEXT := current_setting('app.supabase_service_key', true);
  v_winner_email TEXT;
  v_winner_name TEXT;
BEGIN
  -- Só dispara quando status muda para 'finished' e há um vencedor
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

-- ──────────────────────────────────────────────
-- 5. CRON: Lembrete de documentos pendentes (24h)
-- Requer pg_cron habilitado
-- ──────────────────────────────────────────────

-- Configura variáveis de sessão necessárias
-- Execute UMA vez no SQL Editor:
--   ALTER DATABASE postgres SET app.supabase_project_id = 'SEU_PROJECT_ID';
--   ALTER DATABASE postgres SET app.supabase_service_key = 'SUA_SERVICE_ROLE_KEY';

-- Lembrete 24h: roda todo dia às 09:00
SELECT cron.schedule(
  'email-docs-reminder-24h',
  '0 9 * * *',
  $$
    SELECT
      net.http_post(
        url := 'https://' || current_setting('app.supabase_project_id') || '.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_key')
        ),
        body := jsonb_build_object(
          'type', 'docs-reminder',
          'to', email,
          'payload', jsonb_build_object(
            'name', COALESCE(full_name, 'Usuário'),
            'hours', 24
          )
        )
      )
    FROM profiles
    WHERE kyc_status IS DISTINCT FROM 'approved'
      AND kyc_status IS DISTINCT FROM 'pending'
      AND created_at BETWEEN NOW() - INTERVAL '25 hours' AND NOW() - INTERVAL '23 hours';
  $$
);

-- Lembrete 72h: roda todo dia às 09:30
SELECT cron.schedule(
  'email-docs-reminder-72h',
  '30 9 * * *',
  $$
    SELECT
      net.http_post(
        url := 'https://' || current_setting('app.supabase_project_id') || '.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_key')
        ),
        body := jsonb_build_object(
          'type', 'docs-reminder',
          'to', email,
          'payload', jsonb_build_object(
            'name', COALESCE(full_name, 'Usuário'),
            'hours', 72
          )
        )
      )
    FROM profiles
    WHERE kyc_status IS DISTINCT FROM 'approved'
      AND kyc_status IS DISTINCT FROM 'pending'
      AND created_at BETWEEN NOW() - INTERVAL '73 hours' AND NOW() - INTERVAL '71 hours';
  $$
);

-- Reengajamento (30 dias inativo): roda toda segunda às 10:00
SELECT cron.schedule(
  'email-reengagement-30d',
  '0 10 * * 1',
  $$
    SELECT
      net.http_post(
        url := 'https://' || current_setting('app.supabase_project_id') || '.supabase.co/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_key')
        ),
        body := jsonb_build_object(
          'type', 'reengagement',
          'to', email,
          'payload', jsonb_build_object(
            'name', COALESCE(full_name, 'Usuário')
          )
        )
      )
    FROM profiles
    WHERE kyc_status = 'approved'
      AND id NOT IN (
        SELECT DISTINCT user_id FROM bids
        WHERE created_at > NOW() - INTERVAL '30 days'
      )
      AND created_at < NOW() - INTERVAL '30 days';
  $$
);

-- ──────────────────────────────────────────────
-- VERIFICAR JOBS AGENDADOS:
-- SELECT * FROM cron.job;
--
-- REMOVER UM JOB (se precisar recriar):
-- SELECT cron.unschedule('email-docs-reminder-24h');
-- ──────────────────────────────────────────────
