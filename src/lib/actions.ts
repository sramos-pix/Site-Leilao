import { supabase } from './supabase';

export const placeBid = async (lotId: string, amount: number) => {
  // 1. Verificar autenticação de forma síncrona primeiro
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    throw new Error("Sessão inválida. Por favor, saia e entre novamente na sua conta.");
  }

  const userId = session.user.id;

  // 2. Validar se o lote existe e está ativo antes de tentar inserir
  const { data: lot, error: lotFetchError } = await supabase
    .from('lots')
    .select('id, status, current_bid, start_bid, bid_increment')
    .eq('id', lotId)
    .single();

  if (lotFetchError || !lot) {
    console.error("[placeBid] Erro ao buscar lote:", lotFetchError);
    throw new Error("Não foi possível verificar o status do lote.");
  }

  // 3. Inserir o lance na tabela 'bids'
  // Garantimos que o amount seja um número puro
  const numericAmount = Number(amount);

  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      lot_id: lotId, // Deve ser um UUID válido
      user_id: userId, // Deve ser o UUID do usuário logado
      amount: numericAmount
    });

  if (bidError) {
    console.error("[placeBid] Erro detalhado no lance:", bidError);
    // Se o erro for 23503, é uma chave estrangeira inválida (lot_id ou user_id não existem)
    if (bidError.code === '23503') {
      throw new Error("Erro de integridade: O lote ou usuário não foi reconhecido pelo sistema.");
    }
    throw new Error(`Erro ao registrar lance: ${bidError.message} (Código: ${bidError.code})`);
  }

  // 4. Atualizar o valor atual no lote para refletir o novo lance mais alto
  const { error: updateError } = await supabase
    .from('lots')
    .update({ current_bid: numericAmount })
    .eq('id', lotId);

  if (updateError) {
    console.error("[placeBid] Erro ao atualizar preço do lote:", updateError);
    // Não travamos o processo aqui pois o lance já foi registrado na tabela 'bids'
  }

  return { success: true };
};