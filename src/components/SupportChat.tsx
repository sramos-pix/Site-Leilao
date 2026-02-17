"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, User, Mail, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const SupportChat = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  
  const [visitorData, setVisitorData] = useState({ name: '', email: '' });
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setActiveUserId(authUser.id);
        fetchMessages(authUser.id);
      } else {
        const savedId = localStorage.getItem('autobid_visitor_id');
        const savedName = localStorage.getItem('autobid_visitor_name');
        const savedEmail = localStorage.getItem('autobid_visitor_email');

        if (savedId && savedName && savedEmail) {
          setActiveUserId(savedId);
          setVisitorData({ name: savedName, email: savedEmail });
          fetchMessages(savedId);
        }
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const fetchMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (!error) setMessages(data || []);

      const channel = supabase
        .channel(`support-realtime-${userId}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${userId}` }, 
          (payload) => {
            setMessages(prev => {
              if (prev.find(m => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } catch (e) {
      console.error("Erro ao carregar mensagens:", e);
    }
  };

  const handleIdentifyVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorData.name || !visitorData.email) return;

    setIsLoading(true);
    try {
      const visitorId = localStorage.getItem('autobid_visitor_id') || crypto.randomUUID();
      
      await supabase.from('profiles').upsert({
        id: visitorId,
        full_name: `${visitorData.name} (Visitante)`,
        email: visitorData.email,
        kyc_status: 'guest'
      }).select();

      localStorage.setItem('autobid_visitor_id', visitorId);
      localStorage.setItem('autobid_visitor_name', visitorData.name);
      localStorage.setItem('autobid_visitor_email', visitorData.email);

      setActiveUserId(visitorId);
      setIsIdentifying(false);
      fetchMessages(visitorId);
      
      toast({ title: "Chat iniciado", description: "Como podemos ajudar?" });
    } catch (err) {
      console.error("Erro identificação:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMsg = message.trim();
    if (!trimmedMsg) return;

    if (!activeUserId) {
      setIsIdentifying(true);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          user_id: activeUserId,
          message: trimmedMsg,
          is_from_admin: false
        })
        .select()
        .single();

      if (error) {
        console.error("Erro Supabase:", error);
        // Aumentado o tempo de exibição para 8 segundos (8000ms)
        toast({ 
          variant: "destructive", 
          title: "Acesso Restrito", 
          description: "Para sua segurança, o chat requer uma conta. Por favor, faça login ou cadastre-se rapidamente para falar conosco.",
          duration: 8000 
        });
      } else if (data) {
        setMessages(prev => [...prev, data]);
        setMessage('');
      }
    } catch (err: any) {
      console.error("Erro fatal envio:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
            {isIdentifying ? (
              <div className="h-full flex flex-col justify-center space-y-4 animate-in fade-in">
                <div className="text-center space-y-2 mb-4">
                  <UserCircle className="mx-auto text-orange-500" size={48} />
                  <h3 className="font-bold text-slate-900">Identifique-se</h3>
                  <p className="text-xs text-slate-500">Preencha para iniciar o atendimento.</p>
                </div>
                <form onSubmit={handleIdentifyVisitor} className="space-y-3">
                  <Input 
                    required
                    placeholder="Seu nome" 
                    className="rounded-xl"
                    value={visitorData.name}
                    onChange={e => setVisitorData({...visitorData, name: e.target.value})}
                  />
                  <Input 
                    required
                    type="email"
                    placeholder="seu@email.com" 
                    className="rounded-xl"
                    value={visitorData.email}
                    onChange={e => setVisitorData({...visitorData, email: e.target.value})}
                  />
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl font-bold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Iniciar Chat"}
                  </Button>
                </form>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id || Math.random()} className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.is_from_admin ? "mr-auto" : "ml-auto items-end"
                  )}>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm font-medium shadow-sm",
                      msg.is_from_admin 
                        ? "bg-white text-slate-700 rounded-tl-none border border-slate-100" 
                        : "bg-orange-500 text-white rounded-tr-none"
                    )}>
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-bold">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </span>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-xs italic">
                    {activeUserId ? "Digite sua dúvida abaixo." : "Olá! Identifique-se para começar."}
                  </div>
                )}
              </>
            )}
          </CardContent>

          {!isIdentifying && (
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
          )}
        </Card>
      )}
    </div>
  );
};

export default SupportChat;