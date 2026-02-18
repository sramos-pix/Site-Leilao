import { supabase } from './supabase';

export const placeBid = async (lotId: string, amount: number) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("Você precisa estar logado para dar um lance.");
  }

  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('id, status, current_bid, start_bid, bid_increment')
    .eq('id', lotId)
    .single();

  if (lotError || !lot) {
    throw new Error("Lote não encontrado.");
  }

  if (lot.status === 'finished') {
    throw new Error("Este leilão já foi encerrado.");
  }

  const currentAmount = lot.current_bid || lot.start_bid || 0;
  const minIncrement = lot.bid_increment || 500;
  const minRequired = Number(currentAmount) + Number(minIncrement);

  if (amount < minRequired) {
    throw new Error(`O lance mínimo é R$ ${minRequired.toLocaleString('pt-BR')}`);
  }

  // 1. Inserir o lance
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      lot_id: lotId,
      user_id: user.id,
      amount: amount
    });

  if (bidError) {
    console.error("Erro ao inserir lance:", bidError);
    if (bidError.code === '42501') {
      throw new Error("Permissão negada na tabela de lances. Verifique as políticas de RLS.");
    }
    throw new Error(`Erro no lance: ${bidError.message}`);
  }

  // 2. Atualizar o lote (Aqui é onde o erro 42501 costuma ocorrer se não houver política de UPDATE)
  const { error: updateError } = await supabase
    .from('lots')
    .update({ current_bid: amount })
    .eq('id', lotId);

  if (updateError) {
    console.error("Erro ao atualizar lote:", updateError);
    if (updateError.code === '42501') {
      throw new Error("Lance registrado, mas sem permissão para atualizar o preço do lote. Contate o administrador.");
    }
  }

  return { success: true };
};