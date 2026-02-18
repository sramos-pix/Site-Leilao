import { supabase } from './supabase';

export const placeBid = async (lotId: string, amount: number) => {
  // 1. Obter sessão do usuário
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
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

  // 3. Verificar se o lote está finalizado pelo STATUS (Ignora tempo para urgência)
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
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      lot_id: lotId,
      user_id: session.user.id,
      amount: amount
    });

  if (bidError) {
    console.error("Erro ao inserir lance:", bidError);
    throw new Error("Não foi possível registrar seu lance. Tente novamente.");
  }

  // 6. Atualizar o valor atual no lote
  const { error: updateError } = await supabase
    .from('lots')
    .update({ 
      current_bid: amount
    })
    .eq('id', lotId);

  if (updateError) {
    console.error("Erro ao atualizar lote:", updateError);
  }

  return { success: true };
};