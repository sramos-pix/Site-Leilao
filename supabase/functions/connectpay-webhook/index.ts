import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const bodyText = await req.text();
    console.log("[connectpay-webhook] received", { bodyText });
  } catch (error) {
    console.error("[connectpay-webhook] read error", { error });
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});