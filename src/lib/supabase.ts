import { createClient } from '@supabase/supabase-js';

// No Vite, variáveis de ambiente devem começar com VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log detalhado para o console do navegador (F12)
console.log('--- Diagnóstico Supabase ---');
console.log('URL:', supabaseUrl ? 'Configurada' : 'AUSENTE');
console.log('Key:', supabaseAnonKey ? 'Configurada' : 'AUSENTE');
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas.');
}
console.log('---------------------------');

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export const checkConnection = async () => {
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { connected: false, error: 'URL do Supabase não configurada nas variáveis de ambiente.' };
  }
  try {
    const { data, error } = await supabase.from('auctions').select('count').limit(1);
    if (error) throw error;
    return { connected: true, error: null };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
};