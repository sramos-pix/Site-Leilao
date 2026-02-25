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
  const [guestData, setGuestData] = useState<{id: string, name: string} | null>(null);
  const [tempName, setTempName] = useState('');
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatUserId = user?.id || guestData?.id;

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

      // Se não estiver logado, verifica se já tem uma sessão de visitante salva
      if (!user) {
        const storedGuest = localStorage.getItem('autobid_guest_session');
        if (storedGuest) {
          setGuestData(JSON.parse(storedGuest));
        }
      }
    };

    initChat();
  }, []);

  const [prevMsgCount, setPrevMsgCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);

  // Carrega as mensagens e configura o auto-refresh
  useEffect(() => {
    if (chatUserId) {
      loadMessages();
      
      const interval = setInterval(() => {
        loadMessages();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [chatUserId]);

  // Monitora novas mensagens para abrir o chat automaticamente
  useEffect(() => {
    if (messages.length > prevMsgCount) {
      if (prevMsgCount > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.is_from_admin && !isOpen) {
          setIsOpen(true);
          setHasUnread(true);
          toast({
            title: "Nova mensagem do Suporte",
            description: "A equipe da AutoBid enviou uma mensagem para você.",
          });
        }
      }
      setPrevMsgCount(messages.length);
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!chatUserId) return;
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('user_id', chatUserId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(prev => {
        const isDifferent = prev.length !== data.length || 
                           (prev.length > 0 && data.length > 0 && prev[prev.length-1].id !== data[data.length-1].id);
        
        if (isDifferent) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          return data;
        }
        return prev;
      });
    }
  };

  const handleStartGuestChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    const newGuestData = {
      id: crypto.randomUUID(), // Gera um ID único para o visitante
      name: tempName.trim()
    };

    localStorage.setItem('autobid_guest_session', JSON.stringify(newGuestData));
    setGuestData(newGuestData);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatUserId) return;

    let messageText = newMessage.trim();
    setNewMessage('');
    
    // Se for a primeira mensagem de um visitante, adiciona o nome dele para o admin saber quem é
    if (!user && guestData) {
      const hasSentFirst = localStorage.getItem(`autobid_guest_sent_${guestData.id}`);
      if (!hasSentFirst) {
        messageText = `[Visitante: ${guestData.name}] ${messageText}`;
        localStorage.setItem(`autobid_guest_sent_${guestData.id}`, 'true');
      }
    }

    const tempId = 'temp-' + Date.now();
    const tempMsg = {
      id: tempId,
      user_id: chatUserId,
      message: messageText,
      is_from_admin: false,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const { error } = await supabase.from('support_messages').insert({
        user_id: chatUserId,
        message: messageText,
        is_from_admin: false
      });

      if (error) throw error;
      await loadMessages();
      
    } catch (error: any) {
      console.error("Erro ao enviar:", error);
      toast({ 
        title: "Erro ao enviar", 
        description: error.message || "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive" 
      });
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(newMessage.trim()); // Devolve o texto original (sem a tag de visitante)
    }
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="w-[340px] h-[520px] max-h-[75vh] bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-white/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500 origin-bottom-right">
          
          {/* Cabeçalho */}
          <div className="bg-slate-900 p-4 flex items-center gap-3 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/20 rounded-full blur-3xl -mr-8 -mt-8"></div>
            
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <Headset size={20} className="text-orange-500" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            
            <div className="relative z-10">
              <h3 className="font-black text-white text-base tracking-tight">Suporte AutoBid</h3>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Online agora
              </p>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10 bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
            >
              <X size={16} />
            </button>
          </div>

          {/* Área de Mensagens ou Formulário de Visitante */}
          <div className="flex-1 bg-slate-50/50 p-4 overflow-y-auto flex flex-col gap-3 scroll-smooth">
            {!user && !guestData ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 h-full p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
                  <div className="relative w-16 h-16 bg-white border border-slate-100 shadow-xl rounded-full flex items-center justify-center mb-1">
                    <Headset size={28} className="text-orange-500" />
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg mb-1">Atendimento Online</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Como podemos chamar você?</p>
                </div>
                <form onSubmit={handleStartGuestChat} className="w-full space-y-2.5 mt-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Digite seu nome..."
                    className="h-10 rounded-xl text-center bg-white border-slate-200 focus-visible:ring-orange-500 text-sm"
                    required
                  />
                  <Button type="submit" className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all text-sm">
                    Iniciar Conversa
                  </Button>
                </form>
                <div className="mt-3 pt-3 border-t border-slate-200 w-full">
                  <p className="text-[11px] text-slate-400 mb-1.5">Já tem uma conta?</p>
                  <Button asChild variant="outline" className="w-full rounded-xl h-9 text-xs">
                    <Link to="/login">Fazer Login</Link>
                  </Button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-1">
                  <Headset size={28} className="text-slate-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-1 text-base">
                    Olá, {user ? user.user_metadata?.full_name?.split(' ')[0] : guestData?.name}!
                  </h4>
                  <p className="text-xs text-slate-400">Envie sua dúvida e responderemos o mais rápido possível.</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "max-w-[85%] px-4 py-2.5 text-[14px] shadow-sm relative group",
                    msg.is_from_admin 
                      ? "bg-white border border-slate-100 text-slate-700 self-start rounded-2xl rounded-tl-sm" 
                      : "bg-gradient-to-br from-orange-500 to-orange-600 text-white self-end rounded-2xl rounded-tr-sm shadow-orange-500/20"
                  )}
                >
                  <p className="leading-relaxed">{msg.message}</p>
                  <span className={cn(
                    "text-[9px] block mt-1 font-medium",
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
          {(user || guestData) && (
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  className="flex-1 rounded-full bg-slate-100 border-transparent focus-visible:ring-orange-500 focus-visible:bg-white transition-all h-10 px-4 text-sm"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!newMessage.trim() || isLoading}
                  className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shrink-0 h-10 w-10 shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Botão Flutuante (Só aparece quando o chat está fechado) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasUnread(false);
          }}
          className="relative group flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(249,115,22,0.3)] transition-all duration-500 hover:scale-110 active:scale-95 z-50 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"
        >
          <span className={cn(
            "absolute inset-0 rounded-full animate-ping duration-1000",
            hasUnread ? "bg-red-500 opacity-50" : "bg-orange-500 opacity-30"
          )}></span>
          
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full z-10 animate-bounce"></span>
          )}
          
          <div className="relative flex items-center justify-center">
            <Headset size={24} className="text-white drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
            <Sparkles size={10} className="absolute -top-1 -right-2 text-orange-200 animate-pulse" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-orange-500 rounded-full"></span>
          </div>
        </button>
      )}
    </div>
  );
};

export default SupportChatWidget;