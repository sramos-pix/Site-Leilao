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
    document_type?: string;
  };
}) => {
  const { data: response, error } = await supabase.functions.invoke("connectpay", {
    body: data,
  });

  if (error) {
    return { success: false, error: error.message || "Falha ao chamar a Edge Function." };
  }

  if (!response) {
    return { success: false, error: "Resposta vazia da Edge Function." };
  }

  if (response.success === false) {
    return {
      success: false,
      error: response.error || "Erro ao gerar PIX.",
    };
  }

  if (!response.pix_code) {
    return {
      success: false,
      error: "Código PIX não retornado pela ConnectPay.",
    };
  }

  return {
    success: true,
    pix_code: response.pix_code as string,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(response.pix_code)}`,
    transaction_id: response.transaction_id as string,
  };
};