/// <reference path="./deno-shim.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CONNECTPAY_BASE_URL = "https://api.connectpay.vc";

const WEBHOOK_URL =
  "https://tedinonjoqlhmuclyrfg.supabase.co/functions/v1/connectpay-webhook";

const json200 = (payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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

const isValidIp = (ip: string) => {
  const s = (ip || "").trim();
  if (!s) return false;

  // IPv4
  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  if (ipv4.test(s)) return true;

  // IPv6 (simple check)
  const ipv6 = /^[0-9a-fA-F:]+$/;
  if (s.includes(":") && ipv6.test(s)) return true;

  return false;
};

const getClientIp = (req: Request) => {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim() || "";

  const candidate =
    first ||
    (req.headers.get("cf-connecting-ip") || "").trim() ||
    (req.headers.get("x-real-ip") || "").trim();

  if (isValidIp(candidate)) return candidate;

  // Fallback: ConnectPay só valida formato
  return "127.0.0.1";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json200({ success: false, error: "Método não permitido.", status_code: 405 });
  }

  try {
    const apiSecret = Deno.env.get("CONNECTPAY_API_SECRET");
    if (!apiSecret) {
      console.error("[connectpay] missing CONNECTPAY_API_SECRET");
      return json200({
        success: false,
        error: "CONNECTPAY_API_SECRET não configurado.",
        status_code: 500,
      });
    }

    const body = await req.json();
    console.log("[connectpay] request body", { body });

    if (typeof body?.amount !== "number" || !Number.isFinite(body.amount) || body.amount <= 0) {
      return json200({ success: false, error: "amount inválido.", status_code: 400 });
    }

    if (!body?.description || String(body.description).trim().length < 2) {
      return json200({ success: false, error: "description inválida.", status_code: 400 });
    }

    const customer = mergeCustomer(body.customer);
    const ip = getClientIp(req);

    const payload = {
      external_id: crypto.randomUUID(),
      total_amount: body.amount,
      payment_method: "PIX",
      webhook_url: WEBHOOK_URL,
      ip,
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
      return json200({
        success: false,
        error: resultText || "Erro na ConnectPay.",
        status_code: response.status,
      });
    }

    const result = JSON.parse(resultText);
    const pixCode = result?.pix?.payload;

    if (!pixCode) {
      return json200({
        success: false,
        error: "Código PIX não retornado (pix.payload ausente).",
        status_code: 500,
        raw: result,
      });
    }

    return json200({
      success: true,
      pix_code: pixCode,
      transaction_id: result.id,
      status: result.status || "PENDING",
    });
  } catch (error) {
    console.error("[connectpay] unexpected error", { error });
    return json200({
      success: false,
      error: "Erro interno ao processar pagamento.",
      status_code: 500,
    });
  }
});