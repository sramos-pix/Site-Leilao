"use client";

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export let currentOnlineCount = 0;
export let currentOnlineUsers: any[] = [];

export const OnlinePresenceTracker = () => {
  const location = useLocation();
  const channelRef = useRef<any>(null);
  const locationDataRef = useRef<string | null>(null);

  useEffect(() => {
    const initPresence = async () => {
      // Busca a localização apenas uma vez por sessão para economizar requisições
      if (!locationDataRef.current) {
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.city && data.region) {
            locationDataRef.current = `${data.city}, ${data.region}`;
          } else {
            locationDataRef.current = 'Brasil';
          }
        } catch (e) {
          locationDataRef.current = 'Desconhecido';
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      let profile = null;
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single();
        profile = data;
      }

      const presenceData = {
        id: user?.id || crypto.randomUUID(),
        name: profile?.full_name || 'Visitante',
        email: profile?.email || null,
        isGuest: !user,
        path: location.pathname,
        online_at: new Date().toISOString(),
        location: locationDataRef.current // Adicionando a localização ao payload
      };

      if (!channelRef.current) {
        const channel = supabase.channel('online-users', {
          config: {
            presence: {
              key: presenceData.id,
            },
          },
        });

        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const users = Object.values(state).map((presence: any) => presence[0]);
            
            currentOnlineCount = users.length;
            currentOnlineUsers = users;

            window.dispatchEvent(new CustomEvent('presence-update', {
              detail: { count: users.length, users }
            }));
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channel.track(presenceData);
            }
          });

        channelRef.current = channel;
      } else {
        // Atualiza o caminho se o canal já existir
        channelRef.current.track(presenceData);
      }
    };

    initPresence();

    return () => {
      // Mantemos a conexão viva entre as rotas
    };
  }, [location.pathname]);

  return null;
};

export default OnlinePresenceTracker;