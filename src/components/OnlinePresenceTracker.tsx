import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function OnlinePresenceTracker() {
  useEffect(() => {
    // Cria um canal para rastrear a presença
    const room = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'user-' + Math.random().toString(36).substring(7),
        },
      },
    });

    room.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Quando conectado, envia o status de online
        await room.track({
          online_at: new Date().toISOString(),
          path: window.location.pathname
        });
      }
    });

    // Atualiza o caminho quando o usuário navega
    const handleLocationChange = async () => {
      if (room.state === 'joined') {
        await room.track({
          online_at: new Date().toISOString(),
          path: window.location.pathname
        });
      }
    };

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      supabase.removeChannel(room);
    };
  }, []);

  return null; // Este componente não renderiza nada visualmente
}
