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

    if (!body?.amount || !body?.description || !body?.customer) {
      return new Response(JSON.stringify({ error: "Payload inválido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountInCents = Math.round(body.amount * 100);

    const payload = {
      payment_method: "pix",
      amount: amountInCents,
      description: body.description,
      external_id: crypto.randomUUID(),
      customer: {
        name: body.customer.name,
        document: String(body.customer.document || "").replace(/\D/g, ""),
        type: "individual",
        email: body.customer.email,
        phone: String(body.customer.phone || "11999999999").replace(/\D/g, ""),
      },
    };

    console.log("[connectpay] sending payload", { payload });

    const response = await fetch("https://api.connectpay.vc/v1/payments", {
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
      return new Response(resultText || JSON.stringify({ error: "Erro na ConnectPay." }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(resultText);
    const pixCode = result.pix_qr_code || (result.pix && result.pix.payload);

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
