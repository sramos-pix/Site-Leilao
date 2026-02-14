"use client";

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
    const payload = {
      payment_method: 'pix',
      amount: Math.round(data.amount * 100),
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
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      // Retorna o erro estruturado para o componente
      return {
        success: false,
        error: result.message || result.error || 'Erro desconhecido na API',
        details: result
      };
    }

    // Mapeamento exaustivo de campos possíveis para o código PIX
    const pixCode = result.pix_qr_code || 
                    result.copy_paste || 
                    result.data?.pix_qr_code || 
                    result.data?.copy_paste ||
                    result.pix?.qrcode;

    if (!pixCode) {
      return {
        success: false,
        error: 'API não retornou o código PIX (Copia e Cola)',
        details: result
      };
    }

    return {
      success: true,
      pix_code: pixCode,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`,
      payment_id: result.id || result.data?.id
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Falha na conexão com o servidor de pagamento',
      details: error
    };
  }
};