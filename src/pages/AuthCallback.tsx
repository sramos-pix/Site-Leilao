"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback.tsx
 * ----------------
 * Página intermediária que recebe o redirect do Google OAuth.
 * Aguarda a troca do código PKCE por uma sessão válida (assíncrono),
 * depois verifica se o perfil do usuário está completo.
 *
 * Fluxo:
 *  1. Google redireciona para /auth/callback?code=XXXX
 *  2. Supabase JS troca o code por um token (onAuthStateChange → SIGNED_IN)
 *  3. Se perfil incompleto (sem telefone/CPF) → /app/complete-profile
 *  4. Se perfil completo → /app/dashboard
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Concluindo login com Google...');

  useEffect(() => {
    let handled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (handled) return;

      if (event === 'SIGNED_IN' && session?.user) {
        handled = true;
        setMessage('Login realizado! Verificando seu perfil...');

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone, document_id, city')
            .eq('id', session.user.id)
            .single();

          // Perfil incompleto: usuário Google sem telefone ou CPF
          const isIncomplete = !profile?.phone || !profile?.document_id;

          if (isIncomplete) {
            setMessage('Complete seu cadastro para continuar...');
            navigate('/app/complete-profile', { replace: true });
          } else {
            navigate('/app/dashboard', { replace: true });
          }
        } catch {
          // Se não conseguiu buscar perfil, manda pro dashboard mesmo assim
          navigate('/app/dashboard', { replace: true });
        }
      }

      if (event === 'SIGNED_OUT') {
        handled = true;
        navigate('/login', { replace: true });
      }
    });

    // Fallback: se após 8s ainda não houve evento, redireciona pro login
    const fallbackTimer = setTimeout(() => {
      if (!handled) {
        navigate('/login', { replace: true });
      }
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div className="bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
