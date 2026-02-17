"use client";

import { supabase } from "@/lib/supabase";

const extractErrorMessage = (rawBody: string) => {
  const match = rawBody.match(/"error"\s*:\s*"([^"]+)"/);
  return match?.[1] || rawBody;
};

export const generatePixPayment = async (data: {
  amount: number;
  description: string;
  customer: {
    name: string;
    document: string;
    email: string;
    phone?: string;
  };
}) => {
  const { data: response, error } = await supabase.functions.invoke("connectpay", {
    body: data,
  });

  if (error) {
    const bodyText =
      typeof error?.context?.body === "string" ? error.context.body : "";

    const message = bodyText
      ? extractErrorMessage(bodyText)
      : error.message;

    return { success: false, error: message };
  }

  if (!response?.pix_code) {
    return {
      success: false,
      error: response?.error || "Código PIX não retornado pela ConnectPay.",
    };
  }

  return {
    success: true,
    pix_code: response.pix_code,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(response.pix_code)}`,
    transaction_id: response.transaction_id,
  };
};