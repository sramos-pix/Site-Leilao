import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tedinonjoqlhmuclyrfg.supabase.co';
const supabaseAnonKey = 'sb_publishable_FktbveRx1p1VTumhJM5AJA_YpDaqFmJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('auctions').select('count', { count: 'exact', head: true });
    if (error && (error.code === 'PGRST116' || error.message.includes('relation "auctions" does not exist'))) {
      return { connected: true, error: 'Tabelas não encontradas.' };
    }
    return { connected: true, error: null };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
};