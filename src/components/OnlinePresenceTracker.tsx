import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
      const { data: { session } } = await supabase.auth.getSession();
      
      let userData: any = { 
        isGuest: true, 
        name: 'Visitante', 
        email: '' 
      };

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', session.user.id)
          .single();

        userData = {
          isGuest: false,
          id: session.user.id, // Adicionando o ID do usuário aqui!
          name: profile?.full_name || 'Usuário Cadastrado',
          email: profile?.email || session.user.email || ''
        };
      }

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const count = Object.keys(state).length;
          
          // Achata o array de presenças e remove duplicatas baseadas no ID do usuário (para não contar a mesma pessoa em 2 abas)
          const allUsers = Object.values(state).map((presences: any) => presences[0]);
          
          // Filtra usuários únicos (se o mesmo usuário abrir 3 abas, aparece só 1 vez na lista)
          const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex((t) => (
              t.id === user.id && t.isGuest === user.isGuest && t.name === user.name
            ))
          );
          
          currentOnlineCount = uniqueUsers.length;
          currentOnlineUsers = uniqueUsers;
          
          window.dispatchEvent(new CustomEvent('presence-update', { 
            detail: { count: uniqueUsers.length, users: uniqueUsers } 
          }));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
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