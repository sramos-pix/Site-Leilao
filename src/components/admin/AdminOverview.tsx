"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Gavel, Package, Users, TrendingUp,
  RefreshCw, Loader2, Clock, User, ExternalLink, Trash2, CheckCircle, Undo2, Activity, MessageSquare
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { currentOnlineCount, currentOnlineUsers } from '@/components/OnlinePresenceTracker';

// Função para traduzir a URL em um nome amigável
const formatPath = (path: string) => {
  if (!path || path === '/') return 'Página Inicial';
  
  // Remove o domínio e a porta (ex: http://localhost:32102) se vier junto
  try {
    const url = new URL(path, window.location.origin);
    path = url.pathname;
  } catch (e) {
    // Se não for uma URL válida, continua com o path original
  }
  
  // Se for a página de um lote específico, tenta extrair o ID para mostrar algo mais amigável
  if (path.startsWith('/lots/')) {
    return 'Detalhes do Veículo';
  }
  
  if (path.startsWith('/vehicles')) return 'Catálogo de Veículos';
  if (path.startsWith('/auctions/')) return 'Detalhes do Leilão';
  if (path.startsWith('/auctions')) return 'Lista de Leilões';
  if (path.startsWith('/admin')) return 'Painel Admin';
  if (path.startsWith('/app/dashboard')) return 'Painel do Usuário';
  if (path.startsWith('/app/profile')) return 'Perfil do Usuário';
  if (path.startsWith('/app/favorites')) return 'Favoritos';
  if (path.startsWith('/app/wins')) return 'Histórico de Arremates';
  if (path.startsWith('/login')) return 'Página de Login';
  if (path.startsWith('/register')) return 'Página de Cadastro';
  if (path.startsWith('/how-it-works')) return 'Como Funciona';
  if (path.startsWith('/contact')) return 'Contato';
  
  // Fallback caso seja uma rota desconhecida
  return path;
};

const AdminOverview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    auctions: 0,
    lots: 0,
    users: 0,
    bids: 0
  });
  const [onlineUsers, setOnlineUsers] = useState(currentOnlineCount);
  const [onlineUsersList, setOnlineUsersList] = useState<any[]>(currentOnlineUsers || []);
  const [recentBids, setRecentBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Estados para o modal de mensagem
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{id: string, name: string} | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const isFetchingRef = useRef(false);

  const fetchStats = useCallback(async (force = false) => {
    if (isFetchingRef.current && !force) return;
    isFetchingRef.current = true;

    setIsLoading(true);
    try {
      const [auctions, lots, users, bidsCount] = await Promise.all([
        supabase.from('auctions').select('*', { count: 'exact', head: true }),
        supabase.from('lots').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bids').select('*', { count: 'exact', head: true })
      ]);

      const { data: bids, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (bidsError) throw bidsError;

      setStats({
        auctions: auctions.count || 0,
        lots: lots.count || 0,
        users: users.count || 0,
        bids: bidsCount.count || 0
      });

      if (bids && bids.length > 0) {
        const userIds = [...new Set(bids.map(b => b.user_id))];
        const lotIds = [...new Set(bids.map(b => b.lot_id))];

        const [profilesRes, lotsRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email').in('id', userIds),
          supabase.from('lots').select('id, title, status, winner_id, start_bid').in('id', lotIds)
        ]);

        const profilesMap = (profilesRes.data || []).reduce((acc: any, p) => ({ ...acc, [p.id]: p }), {});
        const lotsMap = (lotsRes.data || []).reduce((acc: any, l) => ({ ...acc, [l.id]: l }), {});

        const enrichedBids = bids.map(bid => ({
          ...bid,
          profiles: profilesMap[bid.user_id],
          lots: lotsMap[bid.lot_id]
        }));

        setRecentBids(enrichedBids);
      } else {
        setRecentBids([]);
      }

    } catch (error: any) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const handleContemplateBid = async (bid: any) => {
    if (!confirm(`Deseja CONTEMPLAR este lance de ${formatCurrency(bid.amount)} para o veículo "${bid.lots?.title}"? Isso encerrará o leilão deste item.`)) return;
    
    setIsProcessing(bid.id);

    try {
      const { error: lotError } = await supabase
        .from('lots')
        .update({ 
          status: 'finished',
          winner_id: bid.user_id,
          current_bid: bid.amount,
          final_price: bid.amount
        })
        .eq('id', bid.lot_id);

      if (lotError) throw lotError;

      toast({ title: "Lance Contemplado!", description: "O veículo foi marcado como finalizado." });
      await fetchStats(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUndoContemplation = async (bid: any) => {
    if (!confirm(`Deseja ESTORNAR a contemplação do veículo "${bid.lots?.title}"? O veículo voltará a ficar ATIVO.`)) return;
    
    setIsProcessing(bid.id);

    try {
      const { error: lotError } = await supabase
        .from('lots')
        .update({ 
          status: 'active',
          winner_id: null,
          final_price: null
        })
        .eq('id', bid.lot_id);

      if (lotError) throw lotError;

      toast({ title: "Contemplação Estornada", description: "O veículo voltou ao status ativo." });
      await fetchStats(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteBid = async (bidId: string, lotId: string, amount: number) => {
    if (!confirm(`Deseja realmente EXCLUIR este lance de ${formatCurrency(amount)}?`)) return;
    
    setIsProcessing(bidId);

    try {
      // 1. Deleta o lance
      const { error: deleteError } = await supabase
        .from('bids')
        .delete()
        .eq('id', bidId);

      if (deleteError) {
        console.error("Erro detalhado do Supabase ao deletar:", deleteError);
        throw new Error(deleteError.message || "Erro de permissão no banco de dados.");
      }

      // 2. Busca o próximo maior lance para este lote
      const { data: nextHighestBid, error: nextBidError } = await supabase
        .from('bids')
        .select('amount')
        .eq('lot_id', lotId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (nextBidError) console.error("Erro ao buscar próximo lance:", nextBidError);

      // 3. Busca o valor inicial do lote caso não haja mais lances
      let newCurrentBid = nextHighestBid?.amount;
      
      if (!newCurrentBid) {
        const { data: lotData } = await supabase
          .from('lots')
          .select('start_bid')
          .eq('id', lotId)
          .single();
        newCurrentBid = lotData?.start_bid || 0;
      }

      // 4. Atualiza o lote
      const { error: updateError } = await supabase
        .from('lots')
        .update({ 
          status: 'active', 
          winner_id: null, 
          final_price: null,
          current_bid: newCurrentBid 
        })
        .eq('id', lotId);

      if (updateError) {
        console.error("Erro ao atualizar lote após exclusão:", updateError);
      }

      toast({ title: "Lance excluído", description: "O sistema foi atualizado com o próximo maior lance." });
      await fetchStats(true);
    } catch (error: any) {
      console.error("Erro na função handleDeleteBid:", error);
      toast({ 
        variant: "destructive", 
        title: "Falha na Exclusão", 
        description: "Verifique se você tem permissões de Admin no Supabase. Erro: " + error.message 
      });
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    fetchStats(true);

    // Escuta o evento global disparado pelo OnlinePresenceTracker
    const handlePresenceUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setOnlineUsers(customEvent.detail.count);
      setOnlineUsersList(customEvent.detail.users || []);
    };

    window.addEventListener('presence-update', handlePresenceUpdate);

    return () => {
      window.removeEventListener('presence-update', handlePresenceUpdate);
    };
  }, [fetchStats]);

  const handleUserClick = (userId: string) => {
    navigate(`/admin?id=${userId}`, { replace: true });
  };

  const openMessageModal = (user: any) => {
    setMessageTarget({ id: user.id, name: user.name });
    setMessageText("");
    setMessageModalOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageTarget || !messageText.trim()) return;
    
    setIsSendingMessage(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          user_id: messageTarget.id,
          message: messageText.trim(),
          is_from_admin: true
        });

      if (error) throw error;

      toast({ title: "Mensagem enviada!", description: `Sua mensagem foi enviada para ${messageTarget.name}.` });
      setMessageModalOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao enviar", description: error.message });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const cards = [
    { title: 'Leilões', value: stats.auctions, icon: Gavel, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Veículos/Lotes', value: stats.lots, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Usuários', value: stats.users, icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Total de Lances', value: stats.bids, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visão Geral</h2>
          <p className="text-slate-500">Métricas e atividades em tempo real.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm cursor-help transition-colors hover:bg-emerald-100">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <span className="font-bold text-sm">{onlineUsers} {onlineUsers === 1 ? 'usuário online' : 'usuários online'}</span>
            </div>
            
            {/* Hover Card com a lista de usuários */}
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usuários Conectados</h4>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{onlineUsers}</span>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {onlineUsersList.length > 0 ? (
                  <ul className="space-y-1">
                    {onlineUsersList.map((u, i) => (
                      <li key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group/item">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${u.isGuest ? 'bg-slate-300' : 'bg-emerald-500'}`}></div>
                          <div className="flex flex-col overflow-hidden">
                            <span className={`text-sm font-medium truncate ${u.isGuest ? 'text-slate-500' : 'text-slate-900'}`}>
                              {u.name || 'Visitante'}
                            </span>
                            {!u.isGuest && u.email && (
                              <span className="text-xs text-slate-400 truncate">{u.email}</span>
                            )}
                            {u.path && (
                              <span className="text-[10px] text-blue-600 font-medium truncate mt-1 bg-blue-50 w-fit px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                📍 {formatPath(u.path)}
                              </span>
                            )}
                          </div>
                        </div>
                        {!u.isGuest && u.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover/item:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => openMessageModal(u)}
                            title="Enviar mensagem"
                          >
                            <MessageSquare size={14} />
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 p-4 text-center">Carregando dados...</p>
                )}
              </div>
            </div>
          </div>

          <Button onClick={() => fetchStats(true)} variant="outline" className="rounded-xl gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={card.color} size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Clock className="text-orange-500" size={20} />
              <CardTitle className="text-lg">Últimos Lances Realizados</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Usuário</TableHead>
                  <TableHead>Veículo / Lote</TableHead>
                  <TableHead>Valor do Lance</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead className="pr-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && recentBids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <Loader2 className="animate-spin mx-auto text-slate-300" />
                    </TableCell>
                  </TableRow>
                ) : recentBids.length > 0 ? (
                  recentBids.map((bid) => {
                    const userName = bid.profiles?.full_name || 'Usuário';
                    const userEmail = bid.profiles?.email || `ID: ${bid.user_id?.substring(0, 8)}`;
                    const isFinished = bid.lots?.status === 'finished';
                    const isWinner = bid.lots?.winner_id === bid.user_id;

                    return (
                      <TableRow key={bid.id} className={`group ${isFinished && isWinner ? 'bg-green-50/30' : ''}`}>
                        <TableCell 
                          className="pl-6 cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => handleUserClick(bid.user_id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                              <User size={14} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 flex items-center gap-1 group-hover:text-orange-600 transition-colors">
                                {userName}
                                <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                              <span className="text-xs text-slate-500">{userEmail}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700">
                              {bid.lots?.title || `Lote #${bid.lot_id}`}
                            </span>
                            {isFinished && isWinner && (
                              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Contemplado</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-black text-orange-600">{formatCurrency(bid.amount)}</span>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {formatDate(bid.created_at)}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isFinished && isWinner ? (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                                onClick={() => handleUndoContemplation(bid)}
                                disabled={isProcessing === bid.id}
                                title="Estornar Contemplação"
                              >
                                {isProcessing === bid.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Undo2 size={18} />}
                              </Button>
                            ) : !isFinished && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                onClick={() => handleContemplateBid(bid)}
                                disabled={isProcessing === bid.id}
                                title="Contemplar Lance"
                              >
                                {isProcessing === bid.id ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle size={18} />}
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                              onClick={() => handleDeleteBid(bid.id, bid.lot_id, bid.amount)}
                              disabled={isProcessing === bid.id}
                              title="Excluir Lance"
                            >
                              {isProcessing === bid.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 size={18} />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-400 italic">
                      Nenhum lance registrado recentemente.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Envio de Mensagem */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enviar Mensagem</DialogTitle>
            <DialogDescription>
              Envie uma mensagem direta para <strong>{messageTarget?.name}</strong>. O chat de suporte abrirá automaticamente na tela do usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Ex: Olá! Vi que você está acompanhando o leilão do Honda Civic. Posso ajudar com alguma dúvida?"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageModalOpen(false)} disabled={isSendingMessage}>
              Cancelar
            </Button>
            <Button onClick={handleSendMessage} disabled={!messageText.trim() || isSendingMessage} className="bg-blue-600 hover:bg-blue-700">
              {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
              Enviar Mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOverview;