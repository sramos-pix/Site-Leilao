"use client";

/**
 * Serviço de Integração ConnectPay
 * Ajustado para compatibilidade com implementações personalizadas
 */

const CONNECT_PAY_API = "https://api.connectpay.vc/v1";
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
    console.log("Gerando pagamento PIX via ConnectPay...");
    
    const payload = {
      payment_method: 'pix',
      amount: Math.round(data.amount * 100), // Valor em centavos
      description: data.description,
      customer: {
        name: data.customer.name,
        document: data.customer.document.replace(/\D/g, ''),
        email: data.customer.email
      }
    };

    const response = await fetch(`${CONNECT_PAY_API}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONNECT_PAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("Resposta da API:", result);

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao processar pagamento na ConnectPay');
    }

    // Tenta encontrar o código PIX em diferentes níveis da resposta
    const pixCode = result.pix_qr_code || 
                    result.data?.pix_qr_code || 
                    result.copy_paste || 
                    result.data?.copy_paste;

    if (!pixCode) {
      throw new Error("Código PIX não retornado pela API.");
    }

    return {
      success: true,
      pix_code: pixCode,
      // Gera o QR Code visual usando o código 'copia e cola'
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`,
      payment_id: result.id || result.data?.id
    };
  } catch (error: any) {
    console.error("Erro ConnectPay:", error);
    throw error;
  }
};