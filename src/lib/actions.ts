import { supabase } from './supabase';

export const placeBid = async (lotId: string, amount: number) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Você precisa estar logado para dar um lance.");
  }

  // 1. Buscar dados atuais do lote
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('*')
    .eq('id', lotId)
    .single();

  if (lotError || !lot) {
    throw new Error("Lote não encontrado.");
  }

  // 2. Verificar se o lote está finalizado pelo STATUS
  // Ignoramos a verificação de tempo (ends_at) para permitir a estratégia de urgência
  if (lot.status === 'finished') {
    throw new Error("Este leilão já foi encerrado.");
  }

  // 3. Verificar se o lance é maior que o atual
  const currentAmount = lot.current_bid || lot.start_bid;
  const minIncrement = lot.bid_increment || 500;

  if (amount < currentAmount + minIncrement) {
    throw new Error(`O lance mínimo permitido é R$ ${(currentAmount + minIncrement).toLocaleString('pt-BR')}`);
  }

  // 4. Inserir o lance
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      lot_id: lotId,
      user_id: session.user.id,
      amount: amount,
      ip_address: '127.0.0.1' // Simplificado para o exemplo
    });

  if (bidError) {
    throw bidError;
  }

  // 5. Atualizar o lote com o novo lance atual
  const { error: updateError } = await supabase
    .from('lots')
    .update({ 
      current_bid: amount,
      // Se houver uma data de término, o trigger no banco cuidará da extensão (anti-sniping)
    })
    .eq('id', lotId);

  if (updateError) {
    throw updateError;
  }

  return { success: true };
};