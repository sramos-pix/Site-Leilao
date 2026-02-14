"use client";

/**
 * Integração ConnectPay via API de Payments
 * Documentação: https://docs.connectpay.vc/
 */

const CONNECTPAY_BASE_URL = "https://api.connectpay.vc";
const CONNECTPAY_API_SECRET = "sk_872e29f3517d2979f4a8af99c8b8855dbd90699a7a98b13e6df12b48c8e89f6c6676876f45bb64e5fe725ec5d56c63594da781aa2478a893885ca4c150d2149f"; 

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
    // A ConnectPay espera o valor em centavos (inteiro)
    const amountInCents = Math.round(data.amount * 100);

    const payload = {
      payment_method: "pix",
      amount: amountInCents,
      description: data.description,
      external_id: crypto.randomUUID(),
      customer: {
        name: data.customer.name,
        document: data.customer.document.replace(/\D/g, ''),
        type: "individual", // individual para CPF
        email: data.customer.email,
        phone: data.customer.phone?.replace(/\D/g, '') || "11999999999"
      }
    };

    // Nota: Se o erro persistir como 'Falha de conexão ou CORS', 
    // significa que a ConnectPay não permite chamadas via Browser.
    const response = await fetch(`${CONNECTPAY_BASE_URL}/v1/payments`, {
      method: 'POST',
      headers: {
        'api-secret': CONNECTPAY_API_SECRET,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Erro na requisição',
        raw: JSON.stringify(result)
      };
    }

    // Na API de Payments, o retorno costuma ser direto
    const pixCode = result.pix_qr_code || result.pix?.payload || result.data?.pix?.payload;

    if (!pixCode) {
      return {
        success: false,
        error: 'Pagamento criado, mas código PIX não retornado.',
        raw: JSON.stringify(result)
      };
    }

    return {
      success: true,
      pix_code: pixCode,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`,
      transaction_id: result.id
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Erro de Conexão (CORS ou Rede)',
      raw: error.message
    };
  }
};