import { supabase } from './supabase';

export const placeBid = async (lotId: string, amount: number) => {
  // Busca a sessão atual de forma mais robusta
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    throw new Error("Sessão expirada ou usuário não autenticado. Por favor, faça login novamente.");
  }

  const userId = session.user.id;

  // 1. Inserir o lance primeiro
  // O RLS 'auth.uid() = user_id' depende do userId estar correto
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      lot_id: lotId,
      user_id: userId,
      amount: amount
    });

  if (bidError) {
    console.error("DEBUG BIDS ERROR:", bidError);
    throw new Error(`Erro ao registrar lance: ${bidError.message} (Código: ${bidError.code})`);
  }

  // 2. Atualizar o valor atual no lote
  const { error: updateError } = await supabase
    .from('lots')
    .update({ current_bid: amount })
    .eq('id', lotId);

  if (updateError) {
    console.error("DEBUG LOTS UPDATE ERROR:", updateError);
    // Não lançamos erro aqui para não confundir o usuário, 
    // já que o lance principal foi inserido com sucesso.
  }

  return { success: true };
};