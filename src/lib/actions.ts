import { supabase } from './supabase';

export async function placeBid(lotId: string, amount: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Você precisa estar logado para dar um lance.');

  // 1. Get lot and auction details
  const { data: lot, error: lotError } = await supabase
    .from('lots')
    .select('*, auctions(*)')
    .eq('id', lotId)
    .single();

  if (lotError || !lot) throw new Error('Lote não encontrado.');

  // 2. Validations
  const now = new Date();
  if (new Date(lot.ends_at) < now) throw new Error('Este leilão já encerrou.');
  if (amount <= (lot.current_bid || lot.start_bid)) {
    throw new Error('O lance deve ser maior que o lance atual.');
  }
  
  const minIncrement = lot.min_increment || lot.auctions.min_increment_default;
  if (amount < (lot.current_bid || lot.start_bid) + minIncrement) {
    throw new Error(`O incremento mínimo é de ${minIncrement}.`);
  }

  // 3. Check deposit if required
  if (lot.auctions.requires_deposit) {
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', user.id)
      .eq('auction_id', lot.auction_id)
      .eq('status', 'paid')
      .single();
    
    if (!payment) throw new Error('Você precisa pagar o depósito de garantia para este leilão.');
  }

  // 4. Insert bid
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      lot_id: lotId,
      user_id: user.id,
      amount: amount
    });

  if (bidError) throw bidError;

  // 5. Anti-sniping logic
  const endsAt = new Date(lot.ends_at);
  const diffMs = endsAt.getTime() - now.getTime();
  const twoMinutesMs = 2 * 60 * 1000;

  if (lot.auctions.anti_sniping_enabled && diffMs < twoMinutesMs) {
    if (lot.extensions_count < lot.auctions.anti_sniping_max_extensions) {
      const newEndsAt = new Date(endsAt.getTime() + lot.auctions.anti_sniping_extend_seconds * 1000);
      await supabase
        .from('lots')
        .update({ 
          ends_at: newEndsAt.toISOString(),
          extensions_count: lot.extensions_count + 1
        })
        .eq('id', lotId);
    }
  }

  return { success: true };
}
