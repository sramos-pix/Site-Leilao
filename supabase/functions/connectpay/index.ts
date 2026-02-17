/// <reference path="./deno-shim.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CONNECTPAY_BASE_URL = "https://api.connectpay.vc";

const cleanDigits = (value: string) => String(value || "").replace(/\D+/g, "");

const mergeCustomer = (input: any) => {
  const c = input || {};
  return {
    name: (c.name || "Cliente").toString().trim(),
    email: (c.email || "cliente@exemplo.com").toString().trim(),
    phone: cleanDigits(c.phone || "11999999999"),
    document_type: String(c.document_type || "CPF").toUpperCase(),
    document: cleanDigits(c.document || "12345678901"),
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const apiSecret = Deno.env.get("CONNECTPAY_API_SECRET");
    if (!apiSecret) {
      console.error("[connectpay] missing CONNECTPAY_API_SECRET");
      return new Response(
        JSON.stringify({ error: "CONNECTPAY_API_SECRET não configurado." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.json();
    console.log("[connectpay] request body", { body });

    if (typeof body?.amount !== "number" || body.amount <= 0) {
      return new Response(JSON.stringify({ error: "amount inválido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!body?.description || String(body.description).trim().length < 2) {
      return new Response(JSON.stringify({ error: "description inválida." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customer = mergeCustomer(body.customer);

    const payload = {
      external_id: crypto.randomUUID(),
      total_amount: body.amount,
      payment_method: "PIX",
      items: [
        {
          id: "item_001",
          title: body.description,
          description: body.description,
          price: body.amount,
          quantity: 1,
          is_physical: false,
        },
      ],
      customer,
    };

    console.log("[connectpay] sending payload", { payload });

    const response = await fetch(`${CONNECTPAY_BASE_URL}/v1/transactions`, {
      method: "POST",
      headers: {
        "api-secret": apiSecret,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resultText = await response.text();
    console.log("[connectpay] response", {
      status: response.status,
      ok: response.ok,
      body: resultText,
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: resultText || "Erro na ConnectPay." }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(resultText);
    const pixCode = result?.pix?.payload;

    if (!pixCode) {
      return new Response(JSON.stringify({ error: "Código PIX não retornado." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        pix_code: pixCode,
        transaction_id: result.id,
        status: result.status || "PENDING",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[connectpay] unexpected error", { error });
    return new Response(JSON.stringify({ error: "Erro interno ao processar pagamento." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});