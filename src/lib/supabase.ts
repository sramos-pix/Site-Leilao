import { createClient } from '@supabase/supabase-js';

// Tenta ler com e sem o prefixo VITE_ para garantir compatibilidade
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn('⚠️ Atenção: As chaves do Supabase não foram detectadas. Certifique-se de que a integração foi concluída e clique em Rebuild.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);