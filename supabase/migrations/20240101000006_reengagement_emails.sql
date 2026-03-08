-- Add columns to track reengagement email status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reengagement_1h_sent TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reengagement_24h_sent TIMESTAMPTZ;

-- Add column for FIPE value (used in Priority 8)
ALTER TABLE lots ADD COLUMN IF NOT EXISTS fipe_value NUMERIC;

-- NOTE: To automate the reengagement emails, set up a cron job in Supabase Dashboard:
-- Go to Database > Extensions > Enable pg_cron
-- Then run:
-- SELECT cron.schedule(
--   'send-reengagement-emails',
--   '0 * * * *', -- Every hour
--   $$
--   SELECT net.http_post(
--     url := 'https://tedinonjoqlhmuclyrfg.supabase.co/functions/v1/send-reengagement-email',
--     headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
--     body := '{}'::jsonb
--   );
--   $$
-- );
--
-- Alternatively, configure RESEND_API_KEY in Edge Function secrets:
-- supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
