"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Send, User, Loader2, Headset, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const SupportChatWidget = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initChat = async () => {
      const { data: settings } = await supabase
        .from('platform_settings')
        .select('chat_enabled')
        .eq('id', 1)
        .single();
      
      if (settings) setIsEnabled(settings.chat_enabled);

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    initChat();
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      loadMessages();
      
      const channel = supabase
        .channel('support_chat_user')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setMessages(prev => {
            const exists = prev.find(m => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  const loadMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    try {
      const { error } = await supabase.from('support_messages').insert({
        user_id: user.id,
        message: messageText,
        is_from_admin: false
      });

      if (error) throw error;
    } catch (error) {
      toast({ 
        title: "Erro ao enviar", 
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive" 
      });
      setNewMessage(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Janela do Chat Premium */}
      {isOpen && (
        <div className="mb-6 w-[380px] h-[600px] max-h-[80vh] bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-white/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500 origin-bottom-right">
          
          {/* Cabeçalho Sofisticado */}
          <div className="bg-slate-900 p-6 flex items-center gap-4 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <Headset size={24} className="text-orange-500" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            
            <div className="relative z-10">
              <h3 className="font-black text-white text-lg tracking-tight">Suporte AutoBid</h3>
              <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Online agora
              </p>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-10 bg-white/5 hover:bg-white/10 p-2 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 bg-slate-50/50 p-5 overflow-y-auto flex flex-col gap-4 scroll-smooth">
            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 h-full p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
                  <div className="relative w-20 h-20 bg-white border border-slate-100 shadow-xl rounded-full flex items-center justify-center mb-2">
                    <User size={36} className="text-orange-500" />
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xl mb-2">Identifique-se</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Faça login ou cadastre-se para conversar em tempo real com nossa equipe de especialistas.</p>
                </div>
                <Button asChild className="bg-slate-900 hover:bg-orange-600 text-white rounded-full px-8 h-12 font-bold w-full transition-all duration-300 shadow-lg mt-4">
                  <Link to="/login">Fazer Login</Link>
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Headset size={32} className="text-slate-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-1 text-lg">Como podemos ajudar?</h4>
                  <p className="text-sm text-slate-400">Envie sua dúvida e responderemos o mais rápido possível.</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "max-w-[85%] px-5 py-3 text-[15px] shadow-sm relative group",
                    msg.is_from_admin 
                      ? "bg-white border border-slate-100 text-slate-700 self-start rounded-2xl rounded-tl-sm" 
                      : "bg-gradient-to-br from-orange-500 to-orange-600 text-white self-end rounded-2xl rounded-tr-sm shadow-orange-500/20"
                  )}
                >
                  <p className="leading-relaxed">{msg.message}</p>
                  <span className={cn(
                    "text-[10px] block mt-1.5 font-medium",
                    msg.is_from_admin ? "text-slate-400 text-left" : "text-orange-100 text-right"
                  )}>
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Envio */}
          {user && (
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  className="flex-1 rounded-full bg-slate-100 border-transparent focus-visible:ring-orange-500 focus-visible:bg-white transition-all h-12 px-5"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!newMessage.trim() || isLoading}
                  className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shrink-0 h-12 w-12 shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Botão Flutuante Premium */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative group flex items-center justify-center w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(249,115,22,0.3)] transition-all duration-500 hover:scale-110 active:scale-95 z-50",
          isOpen 
            ? "bg-slate-900 rotate-90 shadow-xl" 
            : "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"
        )}
      >
        {/* Efeito de pulso quando fechado */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-30 duration-1000"></span>
        )}
        
        {isOpen ? (
          <X size={28} className="text-white -rotate-90 transition-transform duration-500" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Headset size={28} className="text-white drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
            <Sparkles size={12} className="absolute -top-1 -right-2 text-orange-200 animate-pulse" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-orange-500 rounded-full"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default SupportChatWidget;