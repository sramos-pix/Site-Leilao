"use client";

import { supabase } from "@/lib/supabase";

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
    const message =
      (typeof error?.context?.body === "string" && error.context.body) ||
      error.message;

    return { success: false, error: message };
  }

  if (!response?.pix_code) {
    return { success: false, error: response?.error || "Código PIX não retornado pela ConnectPay." };
  }

  return {
    success: true,
    pix_code: response.pix_code,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(response.pix_code)}`,
    transaction_id: response.transaction_id,
  };
};