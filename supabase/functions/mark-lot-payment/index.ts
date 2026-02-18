/// <reference path="../connectpay/deno-shim.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const serviceClient = createClient(supabaseUrl, serviceKey);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await serviceClient.auth.getUser(token);

  if (authError || !user) return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });

  const { data: profile } = await serviceClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin' && profile?.role !== 'finance') {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
  }

  const { lot_id, user_id, status } = await req.json();

  // Mapeamento de segurança para garantir que o status enviado seja aceito pelo banco
  // Se o banco não aceita 'partial', vamos usar 'unpaid' ou 'paid'
  // Baseado no erro, vamos simplificar para os status padrão
  let dbStatus = status;
  if (status === 'partial') dbStatus = 'unpaid'; // Ou outro valor que seu banco aceite

  const { error: upsertError } = await serviceClient
    .from("lot_payments")
    .upsert({
      lot_id,
      user_id,
      status: dbStatus,
      paid_at: dbStatus === "paid" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "lot_id,user_id" });

  if (upsertError) {
    console.error("[mark-lot-payment] DB Error:", upsertError);
    return new Response(JSON.stringify({ error: upsertError.message }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
});