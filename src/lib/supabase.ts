import { createClient } from '@supabase/supabase-js';

// O Vite exige o prefixo VITE_ para variáveis expostas ao cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Se as variáveis VITE_ não existirem, tenta as sem prefixo (fallback)
const finalUrl = supabaseUrl || import.meta.env.SUPABASE_URL;
const finalKey = supabaseAnonKey || import.meta.env.SUPABASE_ANON_KEY;

if (!finalUrl || !finalKey || finalUrl.includes('placeholder')) {
  console.error('❌ ERRO CRÍTICO: Chaves do Supabase ausentes. Clique em "Add Supabase" e depois em "Rebuild".');
}

export const supabase = createClient(
  finalUrl || 'https://placeholder.supabase.co',
  finalKey || 'placeholder-key'
);