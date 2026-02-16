import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tedinonjoqlhmuclyrfg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZGlub25qb3FsaG11Y2x5cmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzY1NjMsImV4cCI6MjA4NjUxMjU2M30.ryrZCH-SxSe9Cx0gTbs747n9YTw2_vSUh-uMmj4efxg';

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