"use client";

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * AuthCallback.tsx
 * ----------------
 * Trata o retorno do OAuth do Google (PKCE flow).
 *
 * Casos tratados:
 *  1. ?error= na URL → exibe mensagem de erro amigável (ex: Database error)
 *  2. Sessão disponível via getSession() → captura após troca PKCE concluída
 *  3. SIGNED_IN via onAuthStateChange → captura se troca ainda em andamento
 *  4. Fallback 10s → redireciona pro login se nada acontecer
 */

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Concluindo login com Google...');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let handled = false;

    // ── ERRO NA URL (ex: Database error saving new user) ─────────────────────
    // O Supabase redireciona com ?error= quando algo falha no servidor
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get('error');
    if (oauthError) {
      handled = true;
      const desc = urlParams.get('error_description') || 'Erro ao autenticar com Google.';
      const friendlyMsg = desc.replace(/\+/g, ' ');
      console.error('[AuthCallback] Erro OAuth na URL:', oauthError, friendlyMsg);
      setMessage('Ocorreu um erro ao conectar sua conta Google. Tente novamente.');
      setHasError(true);
      return;
    }

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirectUser(session.user.id);
      }
    });

    // ── ESTRATÉGIA 2: onAuthStateChange ────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        redirectUser(session.user.id);
      }
    });

    // ── FALLBACK ────────────────────────────────────────────────────────────
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

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 p-4">
        <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-slate-900 font-bold text-xl mb-2">Falha no login com Google</h2>
          <p className="text-slate-500 text-sm">{message}</p>
        </div>
        <Link
          to="/login"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-orange-200"
        >
          Voltar ao Login
        </Link>
      </div>
    );
  }

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
