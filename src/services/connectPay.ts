"use client";

/**
 * Integração ConnectPay via API de Payments
 * Documentação: https://docs.connectpay.vc/
 */

const CONNECTPAY_API_SECRET = "sk_872e29f3517d2979f4a8af99c8b8855dbd90699a7a98b13e6df12b48c8e89f6c6676876f45bb64e5fe725ec5d56c63594da781aa2478a893885ca4c150d2149f"; 

// Proxy AllOrigins para permitir requisições POST do navegador para a API da ConnectPay
const PROXY_URL = "https://api.allorigins.win/raw?url=";
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
    // A API espera o valor em centavos (inteiro)
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

    // Fazemos a chamada através do proxy para evitar erro de CORS
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(TARGET_URL)}`, {
      method: 'POST',
      headers: {
        'api-secret': CONNECTPAY_API_SECRET,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ConnectPay API:", errorText);
      throw new Error(`Erro na intermediadora: ${response.status}`);
    }

    const result = await response.json();

    // Conforme a documentação, o código PIX (payload) vem dentro do objeto 'pix' ou 'pix_qr_code'
    const pixCode = result.pix_qr_code || (result.pix && result.pix.payload);

    if (!pixCode) {
      throw new Error("Pagamento criado, mas o código PIX não foi retornado pela API.");
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
      error: error.message || 'Erro ao processar pagamento PIX'
    };
  }
};