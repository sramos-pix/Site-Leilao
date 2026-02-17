import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Status = "paid" | "unpaid";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Método não permitido." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error("[mark-lot-payment] missing env", { supabaseUrl: !!supabaseUrl, anonKey: !!anonKey, serviceKey: !!serviceKey });
    return new Response(JSON.stringify({ success: false, error: "Configuração do servidor ausente." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const serviceClient = createClient(supabaseUrl, serviceKey);

  const { data: authData, error: authError } = await authClient.auth.getUser();
  if (authError || !authData?.user) {
    console.error("[mark-lot-payment] auth error", { authError });
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const callerId = authData.user.id;

  const { data: adminRow, error: adminError } = await serviceClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", callerId)
    .maybeSingle();

  if (adminError) {
    console.error("[mark-lot-payment] admin check error", { adminError });
    return new Response(JSON.stringify({ success: false, error: "Erro ao validar admin." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!adminRow?.user_id) {
    console.warn("[mark-lot-payment] forbidden (not admin)", { callerId });
    return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => null);
  const lot_id = body?.lot_id as string | undefined;
  const user_id = body?.user_id as string | undefined;
  const status = body?.status as Status | undefined;

  if (!lot_id || !user_id || (status !== "paid" && status !== "unpaid")) {
    return new Response(JSON.stringify({ success: false, error: "Payload inválido." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payload = {
    lot_id,
    user_id,
    status,
    paid_at: status === "paid" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await serviceClient
    .from("lot_payments")
    .upsert(payload, { onConflict: "lot_id,user_id" });

  if (upsertError) {
    console.error("[mark-lot-payment] upsert error", { upsertError, payload });
    return new Response(JSON.stringify({ success: false, error: "Erro ao salvar pagamento." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("[mark-lot-payment] updated", { lot_id, user_id, status, callerId });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});