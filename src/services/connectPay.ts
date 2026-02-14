"use client";

/**
 * Serviço de Integração ConnectPay - Versão Transactions
 * Baseado no código funcional fornecido pelo usuário.
 */

const CONNECTPAY_BASE_URL = "https://api.connectpay.vc";
// Usando o token fornecido como api-secret
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
    // Payload seguindo a estrutura da rota /v1/transactions
    const txPayload = {
      external_id: crypto.randomUUID(),
      total_amount: data.amount, // Valor cheio (ex: 1500.50) conforme o código funcional
      payment_method: "PIX",
      items: [
        {
          id: "item_001",
          title: data.description,
          description: data.description,
          price: data.amount,
          quantity: 1,
          is_physical: false,
        },
      ],
      customer: {
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone?.replace(/\D/g, '') || "11999999999",
        document_type: "CPF",
        document: data.customer.document.replace(/\D/g, ''),
      },
    };

    const response = await fetch(`${CONNECTPAY_BASE_URL}/v1/transactions`, {
      method: 'POST',
      headers: {
        'api-secret': CONNECTPAY_API_SECRET,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(txPayload)
    });

    const result = await response.json();

    if (!response.ok || result.hasError) {
      return {
        success: false,
        error: result.message || result.error || 'Falha ao criar transação',
        details: result
      };
    }

    // No código funcional, o PIX vem em data.pix.payload ou direto em result.pix.payload
    const pixCode = result.pix?.payload || result.data?.pix?.payload;

    if (!pixCode) {
      return {
        success: false,
        error: 'Código PIX não encontrado na resposta da API',
        details: result
      };
    }

    return {
      success: true,
      pix_code: pixCode,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`,
      transaction_id: result.id || result.data?.id
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro de conexão com a ConnectPay',
      details: error
    };
  }
};