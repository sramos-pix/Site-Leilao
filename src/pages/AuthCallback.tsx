"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback.tsx
 * ----------------
 * Corrigido: race condition onde getSession() processava o código PKCE
 * antes do onAuthStateChange ser registrado, causando evento perdido.
 *
 * Estratégia dupla:
 *  1. getSession() — captura a sessão se o código já foi trocado
 *  2. onAuthStateChange(SIGNED_IN) — captura se a troca ainda está em andamento
 */

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Concluindo login com Google...');

  useEffect(() => {
    let handled = false;

    const redirectUser = async (userId: string) => {
      if (handled) return;
      handled = true;
      setMessage('Login realizado! Verificando seu perfil...');

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone, document_id')
          .eq('id', userId)
          .single();

        const isIncomplete = !profile?.phone || !profile?.document_id;

        if (isIncomplete) {
          setMessage('Complete seu cadastro para continuar...');
          navigate('/app/complete-profile', { replace: true });
        } else {
          navigate('/app/dashboard', { replace: true });
        }
      } catch {
        navigate('/app/dashboard', { replace: true });
      }
    };

    // ── ESTRATÉGIA 1: getSession() ──────────────────────────────────────────
    // O Supabase JS processa o ?code= da URL quando getSession() é chamado.
    // Se o código já foi trocado antes do componente montar, isso captura a sessão.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirectUser(session.user.id);
      }
    });

    // ── ESTRATÉGIA 2: onAuthStateChange ────────────────────────────────────
    // Captura o SIGNED_IN se a troca ainda estiver em andamento quando o
    // componente montou (ou se vier logo depois).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        redirectUser(session.user.id);
      }
      // NOTA: não redireciona em SIGNED_OUT aqui para evitar falso-positivo
      // durante a inicialização (INITIAL_SESSION com null antes do SIGNED_IN)
    });

    // ── FALLBACK ────────────────────────────────────────────────────────────
    // Se após 10s nada aconteceu, provavelmente houve erro — manda pro login
    const fallbackTimer = setTimeout(() => {
      if (!handled) {
        console.warn('[AuthCallback] Timeout: nenhuma sessão detectada em 10s');
        navigate('/login', { replace: true });
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div className="bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex items-center gap-3 text-slate-700 font-semibold text-lg">
        <Loader2 className="animate-spin text-orange-500" size={24} />
        {message}
      </div>
      <p className="text-slate-400 text-sm">Aguarde, isso leva apenas um segundo.</p>
    </div>
  );
};

export default AuthCallback;
