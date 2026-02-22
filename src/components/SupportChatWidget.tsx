"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, X, Send, User, ShieldAlert, Loader2 } from 'lucide-react';
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

  // Verifica se o chat está ativado nas configurações e se o usuário está logado
  useEffect(() => {
    const initChat = async () => {
      // 1. Checa configurações
      const { data: settings } = await supabase
        .from('platform_settings')
        .select('chat_enabled')
        .eq('id', 1)
        .single();
      
      if (settings) setIsEnabled(settings.chat_enabled);

      // 2. Checa usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    initChat();
  }, []);

  // Carrega mensagens e escuta novos envios em tempo real
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
          // Adiciona a nova mensagem na lista se não for a que acabamos de enviar (para evitar duplicidade local)
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

  // Rola para a última mensagem automaticamente
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setNewMessage(''); // Limpa o input imediatamente para melhor UX
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
      setNewMessage(messageText); // Restaura o texto em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  // Se estiver desativado no painel, não renderiza nada
  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Janela do Chat */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
          
          {/* Cabeçalho */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex items-center justify-between text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ShieldAlert size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold leading-tight">Suporte Online</h3>
                <p className="text-xs text-orange-100 font-medium">Respondemos em instantes</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4">
            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 h-full">
                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-2">
                  <User size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Identifique-se</h4>
                  <p className="text-sm text-slate-500 px-4">Faça login ou cadastre-se para conversar com nossa equipe de suporte.</p>
                </div>
                <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 mt-2">
                  <Link to="/login">Fazer Login</Link>
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <MessageSquare size={40} className="text-slate-200" />
                <p className="text-sm font-medium">Nenhuma mensagem ainda.<br/>Como podemos ajudar?</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    msg.is_from_admin 
                      ? "bg-white border border-slate-100 text-slate-700 self-start rounded-tl-sm" 
                      : "bg-orange-500 text-white self-end rounded-tr-sm"
                  )}
                >
                  {msg.message}
                  <span className={cn(
                    "text-[10px] block mt-1 text-right opacity-70",
                    msg.is_from_admin ? "text-slate-400" : "text-orange-100"
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
            <div className="p-3 bg-white border-t border-slate-100">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-orange-500"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!newMessage.trim() || isLoading}
                  className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shrink-0 h-10 w-10"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95",
          isOpen 
            ? "bg-slate-800 hover:bg-slate-900 rotate-90" 
            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-orange-500/30"
        )}
      >
        {isOpen ? <X size={28} className="-rotate-90 transition-transform" /> : (
          <div className="relative">
            <MessageSquare size={28} />
            {/* Bolinha de notificação pulsante */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
};

export default SupportChatWidget;