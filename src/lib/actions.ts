import { supabase } from './supabase';

export const placeBid = async (lotId: string, amount: number) => {
  // 1. Obter usuário atual de forma segura
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("Você precisa estar logado para dar um lance.");
  }

  // 2. Buscar dados atuais do lote para validação
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('id, status, current_bid, start_bid, bid_increment')
    .eq('id', lotId)
    .single();

  if (lotError || !lot) {
    throw new Error("Lote não encontrado ou erro ao carregar dados.");
  }

  // 3. Verificar se o lote está finalizado
  if (lot.status === 'finished') {
    throw new Error("Este leilão já foi encerrado oficialmente.");
  }

  // 4. Validar valor do lance
  const currentAmount = lot.current_bid || lot.start_bid || 0;
  const minIncrement = lot.bid_increment || 500;
  const minRequired = Number(currentAmount) + Number(minIncrement);

  if (amount < minRequired) {
    throw new Error(`O lance mínimo permitido é R$ ${minRequired.toLocaleString('pt-BR')}`);
  }

  // 5. Inserir o lance na tabela de bids
  // Importante: O user_id deve ser exatamente o ID do usuário autenticado para passar no RLS
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      lot_id: lotId,
      user_id: user.id,
      amount: amount
    });

  if (bidError) {
    console.error("Erro detalhado do Supabase (Bids):", bidError);
    // Se o erro for de RLS ou violação de chave, mostramos uma mensagem mais clara
    if (bidError.code === '42501') {
      throw new Error("Erro de permissão: Verifique se sua conta está ativa.");
    }
    throw new Error(`Erro ao registrar lance: ${bidError.message}`);
  }

  // 6. Atualizar o valor atual no lote
  const { error: updateError } = await supabase
    .from('lots')
    .update({ 
      current_bid: amount
    })
    .eq('id', lotId);

  if (updateError) {
    console.error("Erro ao atualizar valor no lote:", updateError);
  }

  return { success: true };
};