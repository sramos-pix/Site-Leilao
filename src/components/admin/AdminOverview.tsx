"use client";

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Gavel, Package, Users, TrendingUp, 
  RefreshCw, Loader2, Clock, User, ExternalLink, Trash2 
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Lista de IDs que foram excluídos nesta sessão para evitar que reapareçam via Realtime
  const [deletedBidIds, setDeletedBidIds] = useState<Set<string>>(new Set());
  const ignoreRealtimeRef = useRef(false);

  const fetchStats = async (force = false) => {
    if (!force && ignoreRealtimeRef.current) return;

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
        .limit(20);

      if (bidsError) throw bidsError;

      // Filtra lances que já marcamos como excluídos nesta sessão
      const validBids = (bids || []).filter(b => !deletedBidIds.has(b.id));

      setStats({
        auctions: auctions.count || 0,
        lots: lots.count || 0,
        users: users.count || 0,
        bids: Math.max(0, (bidsCount.count || 0) - deletedBidIds.size)
      });

      if (validBids.length > 0) {
        const userIds = [...new Set(validBids.map(b => b.user_id))];
        const lotIds = [...new Set(validBids.map(b => b.lot_id))];

        const [profilesRes, lotsRes] = await Promise.all([
          supabase.from('profiles').select('id, full_name, email').in('id', userIds),
          supabase.from('lots').select('id, title').in('id', lotIds)
        ]);

        const profilesMap = (profilesRes.data || []).reduce((acc: any, p) => ({ ...acc, [p.id]: p }), {});
        const lotsMap = (lotsRes.data || []).reduce((acc: any, l) => ({ ...acc, [l.id]: l }), {});

        const enrichedBids = validBids.map(bid => ({
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
    }
  };

  const handleDeleteBid = async (bidId: string, lotId: string, amount: number) => {
    if (!confirm(`Deseja realmente excluir este lance de ${formatCurrency(amount)}?`)) return;
    
    setIsDeleting(bidId);
    ignoreRealtimeRef.current = true;
    
    // Adiciona o ID à lista de bloqueio IMEDIATAMENTE
    setDeletedBidIds(prev => new Set(prev).add(bidId));
    
    // Atualização otimista da UI
    setRecentBids(prev => prev.filter(b => b.id !== bidId));
    setStats(prev => ({ ...prev, bids: Math.max(0, prev.bids - 1) }));

    try {
      // 1. Deleta o lance no banco
      const { error: deleteError } = await supabase
        .from('bids')
        .delete()
        .eq('id', bidId);

      if (deleteError) throw deleteError;

      // 2. Busca o novo lance mais alto para este lote
      const { data: nextHighestBid } = await supabase
        .from('bids')
        .select('amount')
        .eq('lot_id', lotId)
        .order('amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      // 3. Atualiza o valor atual do lote
      const newCurrentBid = nextHighestBid?.amount || 0;
      await supabase
        .from('lots')
        .update({ current_bid: newCurrentBid })
        .eq('id', lotId);

      toast({ 
        title: "Lance removido", 
        description: `O valor do lote foi atualizado para ${formatCurrency(newCurrentBid)}.` 
      });
      
    } catch (error: any) {
      // Se der erro, removemos do bloqueio para que ele reapareça
      setDeletedBidIds(prev => {
        const next = new Set(prev);
        next.delete(bidId);
        return next;
      });
      toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
      fetchStats(true);
    } finally {
      setIsDeleting(null);
      setTimeout(() => {
        ignoreRealtimeRef.current = false;
        fetchStats(true);
      }, 3000);
    }
  };

  useEffect(() => {
    fetchStats(true);
    
    const channel = supabase
      .channel('admin-realtime-bids-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => {
        if (!ignoreRealtimeRef.current) {
          fetchStats();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [deletedBidIds]); // Re-executa se a lista de bloqueio mudar

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

                    return (
                      <TableRow key={bid.id} className="group">
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
                              <span className="text-xs text-slate-500">
                                {userEmail}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-slate-700">
                            {bid.lots?.title || `Lote #${bid.lot_id}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-black text-orange-600">{formatCurrency(bid.amount)}</span>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {formatDate(bid.created_at)}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            onClick={() => handleDeleteBid(bid.id, bid.lot_id, bid.amount)}
                            disabled={isDeleting === bid.id}
                          >
                            {isDeleting === bid.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 size={18} />}
                          </Button>
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