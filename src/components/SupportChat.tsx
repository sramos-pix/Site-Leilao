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
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setActiveUserId(authUser.id);
        fetchMessages(authUser.id);
      } else {
        const savedVisitorId = localStorage.getItem('autobid_visitor_id');
        if (savedVisitorId) {
          setActiveUserId(savedVisitorId);
          fetchMessages(savedVisitorId);
        }
      }
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

    const channel = supabase
      .channel(`support-client-${userId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${userId}` }, 
        (payload) => {
          setMessages(prev => {
            const exists = prev.find(m => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const handleIdentifyVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorData.name || !visitorData.email) return;

    setIsLoading(true);
    try {
      // Geramos um ID fixo para este navegador se não existir
      let visitorId = localStorage.getItem('autobid_visitor_id');
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('autobid_visitor_id', visitorId);
      }

      // CRIAMOS O PERFIL NA TABELA PROFILES (Isso permite que a FK da support_messages funcione)
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: visitorId,
        full_name: `${visitorData.name} (Visitante)`,
        email: visitorData.email,
        kyc_status: 'guest'
      }, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      setActiveUserId(visitorId);
      setIsIdentifying(false);
      fetchMessages(visitorId);
      
      toast({ title: "Identificado!", description: "Agora você pode falar com nosso suporte." });
    } catch (err: any) {
      console.error("Erro ao identificar:", err);
      toast({ variant: "destructive", title: "Erro de identificação", description: "Não foi possível iniciar o chat. Tente novamente." });
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

      if (error) throw error;
      
      if (data) {
        setMessages(prev => [...prev, data]);
        setMessage('');
      }
    } catch (err: any) {
      console.error("Erro ao enviar mensagem:", err);
      toast({ 
        variant: "destructive", 
        title: "Erro ao enviar", 
        description: "Sua sessão pode ter expirado. Tente recarregar a página." 
      });
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
                  <p className="text-xs text-slate-500">Para iniciarmos o atendimento, preencha os campos abaixo.</p>
                </div>
                <form onSubmit={handleIdentifyVisitor} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Nome</Label>
                    <Input 
                      required
                      placeholder="Seu nome" 
                      className="rounded-xl"
                      value={visitorData.name}
                      onChange={e => setVisitorData({...visitorData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">E-mail</Label>
                    <Input 
                      required
                      type="email"
                      placeholder="seu@email.com" 
                      className="rounded-xl"
                      value={visitorData.email}
                      onChange={e => setVisitorData({...visitorData, email: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl font-bold mt-2" disabled={isLoading}>
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
                {messages.length === 0 && !activeUserId && (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400 font-bold">Olá! Como podemos ajudar você hoje?</p>
                    <Button 
                      variant="link" 
                      className="text-orange-500 text-xs font-bold"
                      onClick={() => setIsIdentifying(true)}
                    >
                      Clique aqui para iniciar
                    </Button>
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