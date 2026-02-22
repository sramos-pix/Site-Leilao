"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, User, MessageSquare, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const AdminChat = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Busca a lista de conversas (silent = true evita que o ícone fique girando no auto-refresh)
  const fetchConversations = async (silent = false) => {
    if (!silent) setIsFetching(true);
    try {
      const { data: msgs, error: msgsError } = await supabase
        .from('support_messages')
        .select('user_id, created_at')
        .order('created_at', { ascending: false });

      if (msgsError) throw msgsError;

      if (!msgs || msgs.length === 0) {
        setConversations([]);
        return;
      }

      const uniqueUserIds = Array.from(new Set(msgs.map(m => m.user_id)));

      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', uniqueUserIds);

      if (profError) console.error("Erro ao buscar perfis:", profError);

      const convs = uniqueUserIds.map(uid => {
        const profile = profiles?.find(p => p.id === uid);
        const lastMsg = msgs.find(m => m.user_id === uid);
        return {
          user_id: uid,
          created_at: lastMsg?.created_at,
          profiles: profile || { full_name: 'Usuário Desconhecido', email: uid.substring(0, 8) }
        };
      });
      
      setConversations(convs);
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
    } finally {
      if (!silent) setIsFetching(false);
    }
  };

  // Busca as mensagens da conversa selecionada
  const fetchMessages = async (userId: string) => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setMessages(prev => {
        // Só atualiza o estado se houver mensagens novas para evitar que a tela pisque
        const isDifferent = prev.length !== data.length || 
                           (prev.length > 0 && data.length > 0 && prev[prev.length-1].id !== data[data.length-1].id);
        
        if (isDifferent) {
          setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }, 100);
          return data;
        }
        return prev;
      });
    }
  };

  // Auto-refresh para a lista de conversas
  useEffect(() => {
    fetchConversations();
    
    const interval = setInterval(() => {
      fetchConversations(true); // silent refresh
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh para as mensagens da conversa aberta
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id);
      
      const interval = setInterval(() => {
        fetchMessages(selectedUser.user_id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const handleDeleteConversation = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir toda esta conversa? Esta ação não pode ser desfeita.")) return;

    setIsDeleting(userId);
    try {
      const { error } = await supabase
        .from('support_messages')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({ title: "Conversa excluída", description: "Todas as mensagens foram removidas." });
      
      if (selectedUser?.user_id === userId) {
        setSelectedUser(null);
        setMessages([]);
      }
      
      fetchConversations();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: err.message });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedReply = reply.trim();
    if (!trimmedReply || !selectedUser) return;

    // 1. ATUALIZAÇÃO OTIMISTA: Mostra a mensagem na tela IMEDIATAMENTE
    const tempId = 'temp-' + Date.now();
    const tempMsg = {
      id: tempId,
      user_id: selectedUser.user_id,
      message: trimmedReply,
      is_from_admin: true,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMsg]);
    setReply('');

    // Rola para baixo instantaneamente
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);

    setIsLoading(true);
    try {
      // 2. Envia para o banco de dados
      const { error } = await supabase
        .from('support_messages')
        .insert({
          user_id: selectedUser.user_id,
          message: trimmedReply,
          is_from_admin: true
        });

      if (error) throw error;
      
      // 3. Recarrega para pegar o ID oficial gerado pelo banco
      await fetchMessages(selectedUser.user_id);
      fetchConversations(true); // Atualiza a lista lateral silenciosamente
      
    } catch (err) {
      console.error("Erro ao responder:", err);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao enviar mensagem." });
      // Reverte a mensagem em caso de erro
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setReply(trimmedReply);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      <Card className="col-span-4 border-none shadow-sm rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-50 border-b font-bold text-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-orange-500" /> Conversas
          </div>
          <Button variant="ghost" size="icon" onClick={() => fetchConversations(false)} disabled={isFetching}>
            <RefreshCw size={14} className={cn(isFetching && "animate-spin")} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? conversations.map((conv) => (
            <div
              key={conv.user_id}
              onClick={() => setSelectedUser(conv)}
              className={cn(
                "w-full p-4 text-left border-b border-slate-50 transition-colors flex items-center gap-3 cursor-pointer group",
                selectedUser?.user_id === conv.user_id ? "bg-orange-50 border-orange-100" : "hover:bg-slate-50"
              )}
            >
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User size={20} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-sm text-slate-900 truncate">{conv.profiles?.full_name}</p>
                <p className="text-[10px] text-slate-500 truncate">{conv.profiles?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                onClick={(e) => handleDeleteConversation(e, conv.user_id)}
                disabled={isDeleting === conv.user_id}
              >
                {isDeleting === conv.user_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
              </Button>
            </div>
          )) : (
            <div className="p-8 text-center text-slate-400 text-sm">Nenhuma conversa encontrada.</div>
          )}
        </div>
      </Card>

      <Card className="col-span-8 border-none shadow-sm rounded-2xl overflow-hidden flex flex-col bg-white">
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="font-bold text-slate-900">{selectedUser.profiles?.full_name}</div>
                <div className="text-xs text-slate-400">{selectedUser.profiles?.email}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50" ref={scrollRef}>
              {messages.map((msg) => (
                <div key={msg.id || Math.random()} className={cn(
                  "flex flex-col max-w-[70%]",
                  msg.is_from_admin ? "ml-auto items-end" : "mr-auto"
                )}>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm font-medium shadow-sm",
                    msg.is_from_admin 
                      ? "bg-slate-900 text-white rounded-tr-none" 
                      : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                  )}>
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-bold">
                    {new Date(msg.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleReply} className="p-4 border-t flex gap-3 bg-white">
              <Input 
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="rounded-xl h-12"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !reply.trim()} className="bg-orange-500 hover:bg-orange-600 h-12 px-6 rounded-xl">
                {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="font-bold">Selecione uma conversa para responder</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminChat;