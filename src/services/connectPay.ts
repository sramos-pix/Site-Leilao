"use client";

/**
 * Integração ConnectPay via API de Payments
 * Documentação: https://docs.connectpay.vc/
 */

const CONNECTPAY_API_SECRET = "sk_872e29f3517d2979f4a8af99c8b8855dbd90699a7a98b13e6df12b48c8e89f6c6676876f45bb64e5fe725ec5d56c63594da781aa2478a893885ca4c150d2149f"; 

// Corsproxy.io é excelente para manter headers customizados como o api-secret
const PROXY_URL = "https://corsproxy.io/?";
const TARGET_URL = "https://api.connectpay.vc/v1/payments";

export const generatePixPayment = async (data: {
  amount: number;
  description: string;
  customer: {
    name: string;
    document: string;
    email: string;
    phone?: string;
  }
}) => {
  try {
    // Valor em centavos conforme documentação
    const amountInCents = Math.round(data.amount * 100);

    const payload = {
      payment_method: "pix",
      amount: amountInCents,
      description: data.description,
      external_id: crypto.randomUUID(),
      customer: {
        name: data.customer.name,
        document: data.customer.document.replace(/\D/g, ''),
        type: "individual",
        email: data.customer.email,
        phone: data.customer.phone?.replace(/\D/g, '') || "11999999999"
      }
    };

    // A URL final para o proxy deve ser codificada
    const finalUrl = `${PROXY_URL}${encodeURIComponent(TARGET_URL)}`;

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'api-secret': CONNECTPAY_API_SECRET,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro na API' }));
      throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
    }

    const result = await response.json();

    // Extração do código PIX (payload) da resposta
    const pixCode = result.pix_qr_code || (result.pix && result.pix.payload);

    if (!pixCode) {
      console.error("Resposta inesperada da ConnectPay:", result);
      throw new Error("O código PIX não foi retornado pela intermediadora.");
    }

    return {
      success: true,
      pix_code: pixCode,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`,
      transaction_id: result.id
    };
  } catch (error: any) {
    console.error("Erro na integração ConnectPay:", error);
    return {
      success: false,
      error: error.message === 'Failed to fetch' 
        ? 'Erro de conexão com o servidor de pagamentos. Tente novamente.' 
        : error.message
    };
  }
};