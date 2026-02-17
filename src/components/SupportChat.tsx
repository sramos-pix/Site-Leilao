"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchMessages(user.id);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const fetchMessages = async (userId: string) => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (!error) setMessages(data || []);

    // Realtime subscription
    const channel = supabase
      .channel(`support-client-${userId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${userId}` }, 
        (payload) => {
          setMessages(prev => {
            // Evita duplicatas se o insert local já adicionou
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMsg = message.trim();
    if (!trimmedMsg || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          user_id: user.id,
          message: trimmedMsg,
          is_from_admin: false
        })
        .select()
        .single();

      if (error) throw error;
      
      // Atualiza localmente para feedback instantâneo
      if (data) {
        setMessages(prev => [...prev, data]);
        setMessage('');
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-200 animate-bounce"
        >
          <MessageCircle size={28} />
        </Button>
      ) : (
        <Card className="w-80 md:w-96 h-[500px] flex flex-col shadow-2xl border-none rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4">
          <CardHeader className="bg-slate-900 text-white p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-xl">
                <User size={18} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Suporte AutoBid</CardTitle>
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Online agora</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
              <X size={20} />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id || Math.random()} className={cn(
                "flex flex-col max-w-[80%]",
                msg.is_from_admin ? "mr-auto" : "ml-auto items-end"
              )}>
                <div className={cn(
                  "p-3 rounded-2xl text-sm font-medium shadow-sm",
                  msg.is_from_admin 
                    ? "bg-white text-slate-700 rounded-tl-none" 
                    : "bg-orange-500 text-white rounded-tr-none"
                )}>
                  {msg.message}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-bold">
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Enviando...'}
                </span>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400 font-bold">Olá! Como podemos ajudar você hoje?</p>
              </div>
            )}
          </CardContent>

          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua dúvida..."
              className="rounded-xl border-slate-100 bg-slate-50"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !message.trim()} className="bg-slate-900 rounded-xl">
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default SupportChat;