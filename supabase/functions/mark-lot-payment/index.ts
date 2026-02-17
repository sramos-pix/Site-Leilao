/// <reference path="../connectpay/deno-shim.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
};

type Status = "paid" | "unpaid";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const adminSecret = Deno.env.get("CONNECTPAY_API_SECRET"); // Usando como chave mestra

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ success: false, error: "Configuração do servidor ausente." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const serviceClient = createClient(supabaseUrl, serviceKey);

  // Validação de Autenticação (JWT ou Admin Key)
  const authHeader = req.headers.get("Authorization");
  const adminKeyHeader = req.headers.get("x-admin-key");
  let isAuthorized = false;

  // 1. Tenta validar via Admin Key (Painel admin/admin)
  if (adminKeyHeader && adminSecret && adminKeyHeader === adminSecret) {
    isAuthorized = true;
  } 
  // 2. Tenta validar via JWT (Usuário logado com role admin)
  else if (authHeader) {
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: { user }, error: authError } = await serviceClient.auth.getUser(token);
    
    if (!authError && user) {
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      
      if (profile?.role === 'admin') isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return new Response(JSON.stringify({ success: false, error: "Não autorizado." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => null);
  const lot_id = body?.lot_id;
  const user_id = body?.user_id;
  const status = body?.status as Status;

  if (!lot_id || !user_id || (status !== "paid" && status !== "unpaid")) {
    return new Response(JSON.stringify({ success: false, error: "Payload inválido." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: upsertError } = await serviceClient
    .from("lot_payments")
    .upsert({
      lot_id,
      user_id,
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "lot_id,user_id" });

  if (upsertError) {
    return new Response(JSON.stringify({ success: false, error: upsertError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});