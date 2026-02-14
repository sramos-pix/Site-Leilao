"use client";

/**
 * Serviço de Integração ConnectPay
 * Documentação: https://docs.connectpay.vc/
 */

const CONNECT_PAY_API = "https://api.connectpay.vc/v1";

// Token configurado pelo usuário
const CONNECT_PAY_TOKEN = "sk_872e29f3517d2979f4a8af99c8b8855dbd90699a7a98b13e6df12b48c8e89f6c6676876f45bb64e5fe725ec5d56c63594da781aa2478a893885ca4c150d2149f"; 

export const generatePixPayment = async (data: {
  amount: number;
  description: string;
  customer: {
    name: string;
    document: string;
    email: string;
  }
}) => {
  try {
    console.log("Iniciando requisição ConnectPay para:", data.customer.email);
    
    const response = await fetch(`${CONNECT_PAY_API}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONNECT_PAY_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        payment_method: 'pix',
        amount: Math.round(data.amount * 100), // Centavos
        description: data.description,
        customer: {
          name: data.customer.name,
          document: data.customer.document.replace(/\D/g, ''),
          email: data.customer.email
        },
        postback_url: `${window.location.origin}/api/webhooks/connectpay`
      })
    });

    const result = await response.json();
    console.log("Resposta ConnectPay:", result);

    if (!response.ok) {
      throw new Error(result.message || 'Erro na API ConnectPay');
    }

    // O código PIX pode vir em campos diferentes dependendo da versão da API
    const pixCode = result.pix_qr_code || result.copy_paste || result.data?.pix_qr_code;
    
    return {
      success: true,
      pix_code: pixCode,
      // Fallback para gerador de QR Code caso a API não envie a URL da imagem
      qr_code_url: result.pix_image_url || result.data?.pix_image_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`,
      payment_id: result.id || result.data?.id
    };
  } catch (error: any) {
    console.error("ConnectPay Error Details:", error);
    throw error;
  }
};