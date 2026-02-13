import { createClient } from '@supabase/supabase-js';

// Configuração direta para garantir o funcionamento imediato
const supabaseUrl = 'https://tedinonjoqlhmuclyrfg.supabase.co';
const supabaseAnonKey = 'sb_publishable_FktbveRx1p1VTumhJM5AJA_YpDaqFmJ';

console.log('--- Conexão Supabase ---');
console.log('URL configurada manualmente.');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const checkConnection = async () => {
  try {
    // Tenta buscar a contagem de leilões para validar a conexão
    const { data, error } = await supabase.from('auctions').select('count', { count: 'exact', head: true });
    
    if (error) {
      // Se o erro for que a tabela não existe, a conexão em si está ok, mas o schema falta
      if (error.code === 'PGRST116' || error.message.includes('relation "auctions" does not exist')) {
        return { connected: true, error: 'Conectado, mas as tabelas ainda não foram criadas no banco.' };
      }
      throw error;
    }
    return { connected: true, error: null };
  } catch (err: any) {
    console.error('Erro de conexão:', err);
    return { connected: false, error: err.message };
  }
};