import { createClient } from '@supabase/supabase-js';

// No Vite, variáveis de ambiente devem começar com VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log para diagnóstico (visível no console do navegador F12)
console.log('Supabase URL configurada:', supabaseUrl ? 'Sim' : 'Não');
console.log('Supabase Key configurada:', supabaseAnonKey ? 'Sim' : 'Não');

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Função auxiliar para testar a conexão
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('auctions').select('count').limit(1);
    if (error) throw error;
    return { connected: true, error: null };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
};