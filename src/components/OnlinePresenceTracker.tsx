import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'react-router-dom';

export let currentOnlineCount = 1;
export let currentOnlineUsers: any[] = [];

export function OnlinePresenceTracker() {
  const location = useLocation();
  const channelRef = useRef<any>(null);
  const userDataRef = useRef<any>(null);

  useEffect(() => {
    const sessionId = 'user-' + Math.random().toString(36).substring(2, 15);

    const channel = supabase.channel('global-presence', {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });
    
    channelRef.current = channel;

    const setupPresence = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      let userData: any = { 
        isGuest: true, 
        name: 'Visitante', 
        email: '',
        path: window.location.pathname // Captura a página inicial
      };

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', session.user.id)
          .single();

        userData = {
          isGuest: false,
          id: session.user.id,
          name: profile?.full_name || 'Usuário Cadastrado',
          email: profile?.email || session.user.email || '',
          path: window.location.pathname // Captura a página inicial
        };
      }
      
      userDataRef.current = userData;

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const allUsers = Object.values(state).map((presences: any) => presences[0]);
          
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
              ...userDataRef.current
            });
          }
        });
    };

    setupPresence();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Este useEffect é disparado toda vez que o usuário muda de página
  useEffect(() => {
    if (channelRef.current && userDataRef.current) {
      userDataRef.current.path = location.pathname;
      
      // Se o canal já estiver conectado, atualiza o status com a nova página
      if (channelRef.current.state === 'joined') {
        channelRef.current.track({
          online_at: new Date().toISOString(),
          ...userDataRef.current
        });
      }
    }
  }, [location.pathname]);

  return null;
}