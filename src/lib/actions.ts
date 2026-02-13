import { supabase } from './supabase';

/**
 * Calcula o incremento mínimo baseado no valor atual
 * Regra: 
 * Até 20k -> 200
 * Até 50k -> 500
 * Até 100k -> 1.000
 * Acima -> 2.000
 */
function calculateMinIncrement(currentValue: number): number {
  if (currentValue < 20000) return 200;
  if (currentValue < 50000) return 500;
  if (currentValue < 100000) return 1000;
  return 2000;
}

export async function placeBid(lotId: string, amount: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Você precisa estar logado para dar um lance.');

  // 1. Buscar detalhes do lote e do leilão
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('*, auctions(*)')
    .eq('id', lotId)
    .single();

  if (lotError || !lot) throw new Error('Lote não encontrado.');

  // 2. Validações de Tempo
  const now = new Date();
  const endsAt = new Date(lot.ends_at);
  if (endsAt < now) throw new Error('Este leilão já encerrou.');

  // 3. Validação de Valor e Incremento
  const currentBid = lot.current_bid || lot.start_bid;
  const requiredIncrement = calculateMinIncrement(currentBid);
  
  if (amount < currentBid + requiredIncrement) {
    throw new Error(`O lance mínimo para este veículo é de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentBid + requiredIncrement)} (Incremento de ${requiredIncrement})`);
  }

  // 4. Inserir o lance
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      lot_id: lotId,
      user_id: user.id,
      amount: amount,
      ip_address: 'client-side', // Idealmente capturado no server/edge
    });

  if (bidError) throw bidError;

  // 5. Lógica Anti-Sniper
  const diffMs = endsAt.getTime() - now.getTime();
  const triggerMs = (lot.auctions.anti_sniping_trigger_minutes || 2) * 60 * 1000;

  if (lot.auctions.anti_sniping_enabled && diffMs < triggerMs) {
    // Verifica se ainda não atingiu o limite de extensões
    if (lot.extensions_count < (lot.auctions.anti_sniping_max_extensions || 10)) {
      const extensionSeconds = lot.auctions.anti_sniping_extend_seconds || 120;
      const newEndsAt = new Date(endsAt.getTime() + extensionSeconds * 1000);
      
      await supabase
        .from('lots')
        .update({ 
          ends_at: newEndsAt.toISOString(),
          extensions_count: (lot.extensions_count || 0) + 1
        })
        .eq('id', lotId);
        
      console.log(`Anti-sniper ativado: Leilão estendido até ${newEndsAt.toLocaleTimeString()}`);
    }
  }

  return { success: true };
}