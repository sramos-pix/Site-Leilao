"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Gavel, Package, Users, TrendingUp, 
  RefreshCw, Loader2, Clock, User, ExternalLink, Trash2, CheckCircle, Undo2
} from 'lucide-react';
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

const AdminOverview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    auctions: 0,
    lots: 0,
    users: 0,
    bids: 0
  });
  const [recentBids, setRecentBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
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
          supabase.from('lots').select('id, title, status, winner_id').in('id', lotIds)
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
    if (!confirm(`Deseja realmente EXCLUIR este lance de ${formatCurrency(amount)}? Se este for o lance vencedor, o veículo será resetado para ATIVO.`)) return;
    
    setIsProcessing(bidId);

    try {
      // 1. Deleta o lance
      const { error: deleteError } = await supabase
        .from('bids')
        .delete()
        .eq('id', bidId);

      if (deleteError) throw deleteError;

      // 2. Busca o próximo maior lance
      const { data: nextHighestBid } = await supabase
        .from('bids')
        .select('amount')
        .eq('lot_id', lotId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      const newCurrentBid = nextHighestBid?.amount || 0;

      // 3. Reseta o lote para 'active' e limpa o vencedor, atualizando o valor atual
      await supabase
        .from('lots')
        .update({ 
          status: 'active', 
          winner_id: null, 
          final_price: null,
          current_bid: newCurrentBid 
        })
        .eq('id', lotId);

      toast({ title: "Lance excluído", description: "O veículo foi resetado para o status ativo." });
      await fetchStats(true);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    fetchStats(true);
  }, [fetchStats]);

  const handleUserClick = (userId: string) => {
    navigate(`/admin?id=${userId}`, { replace: true });
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
        <Button onClick={() => fetchStats(true)} variant="outline" className="rounded-xl gap-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
          Atualizar
        </Button>
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
    </div>
  );
};

export default AdminOverview;