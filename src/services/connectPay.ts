"use client";

// Nota: Em produção, estas chamadas devem ser feitas via Proxy ou Backend para não expor sua Secret Key.
const CONNECT_PAY_API = "https://api.connectpay.vc/v1";

export const generatePixPayment = async (data: {
  amount: number;
  description: string;
  customer: {
    name: string;
    document: string;
    email: string;
  }
}) => {
  // Aqui você inseriria sua lógica de fetch para a ConnectPay
  // Exemplo de estrutura baseada na documentação:
  /*
  const response = await fetch(`${CONNECT_PAY_API}/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CONNECT_PAY_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      payment_method: 'pix',
      amount: data.amount,
      description: data.description,
      customer: data.customer
    })
  });
  return await response.json();
  */

  // Simulação de resposta para desenvolvimento visual
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    success: true,
    pix_code: "00020101021226850014br.gov.bcb.pix0123456789012345678901234567890123456789520400005303986540510.005802BR5925AUTOBID LEILOES6009SAO PAULO62070503***6304E2B1",
    qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=autobid-pix-mock",
    payment_id: "pay_" + Math.random().toString(36).substr(2, 9)
  };
};