"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notificações:', error);
    } else {
      setNotifications(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    // Marcar todas como lidas ao entrar na página
    const markAsRead = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false);
      }
    };

    markAsRead();
  }, []);

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir." });
    } else {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Clock className="animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Bell className="text-orange-500" /> Notificações
        </h1>
      </div>

      {notifications.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>Você não tem nenhuma notificação no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`overflow-hidden border-none shadow-sm transition-all ${notification.read ? 'bg-white' : 'bg-orange-50/50 border-l-4 border-l-orange-500'}`}>
              <CardContent className="p-4 flex gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${notification.read ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600'}`}>
                  <Bell size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-sm ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-300 hover:text-red-500"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;