import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Variáveis globais para manter o estado atual
export let currentOnlineCount = 1;
export let currentOnlineUsers: any[] = [];

export function OnlinePresenceTracker() {
  useEffect(() => {
    const sessionId = 'user-' + Math.random().toString(36).substring(2, 15);

    const channel = supabase.channel('global-presence', {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    const setupPresence = async () => {
      // 1. Verifica se o usuário atual está logado
      const { data: { session } } = await supabase.auth.getSession();
      
      // Dados padrão para visitantes
      let userData = { 
        isGuest: true, 
        name: 'Visitante', 
        email: '' 
      };

      // Se estiver logado, busca o nome e email no perfil
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', session.user.id)
          .single();

        userData = {
          isGuest: false,
          name: profile?.full_name || 'Usuário Cadastrado',
          email: profile?.email || session.user.email || ''
        };
      }

      // 2. Configura os eventos do canal
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const count = Object.keys(state).length;
          
          // Extrai os dados de cada usuário conectado
          const users = Object.values(state).map((presences: any) => presences[0]);
          
          currentOnlineCount = count;
          currentOnlineUsers = users;
          
          // Envia a contagem E a lista de usuários para o painel admin
          window.dispatchEvent(new CustomEvent('presence-update', { 
            detail: { count, users } 
          }));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Registra a presença enviando os dados do usuário junto
            await channel.track({
              online_at: new Date().toISOString(),
              ...userData
            });
          }
        });
    };

    setupPresence();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}