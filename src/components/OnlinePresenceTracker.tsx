import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Variável global para manter o estado atual caso o componente admin seja montado depois
export let currentOnlineCount = 1;

export function OnlinePresenceTracker() {
  useEffect(() => {
    // Gera um ID único para esta aba/sessão
    const sessionId = 'user-' + Math.random().toString(36).substring(2, 15);

    // Cria um canal global para presença
    const channel = supabase.channel('global-presence', {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Conta quantas chaves únicas (sessões) estão conectadas
        const count = Object.keys(state).length;
        
        currentOnlineCount = count;
        
        // Dispara um evento customizado para que o painel admin possa escutar
        window.dispatchEvent(new CustomEvent('presence-update', { detail: { count } }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Quando conectado, registra a presença
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
