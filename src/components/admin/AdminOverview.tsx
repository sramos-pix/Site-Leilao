"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Gavel, Package, Users, TrendingUp, 
  RefreshCw, Loader2, Clock, User 
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    auctions: 0,
    lots: 0,
    users: 0,
    bids: 0
  });
  const [recentBids, setRecentBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [auctions, lots, users, bids] = await Promise.all([
        supabase.from('auctions').select('*', { count: 'exact', head: true }),
        supabase.from('lots').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('bids').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        auctions: auctions.count || 0,
        lots: lots.count || 0,
        users: users.count || 0,
        bids: bids.count || 0
      });

      // Busca os 10 lances mais recentes com dados do usuário e do lote
      const { data: bidsData } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          created_at,
          profiles (full_name, email),
          lots (title)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentBids(bidsData || []);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Realtime para novos lances no dashboard admin
    const channel = supabase
      .channel('admin-dashboard-bids')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bids' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        <Button onClick={fetchStats} variant="outline" className="rounded-xl gap-2" disabled={isLoading}>
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
                  <TableHead className="pr-6">Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && recentBids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <Loader2 className="animate-spin mx-auto text-slate-300" />
                    </TableCell>
                  </TableRow>
                ) : recentBids.length > 0 ? (
                  recentBids.map((bid) => (
                    <TableRow key={bid.id} className="group">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{bid.profiles?.full_name || 'Usuário'}</span>
                            <span className="text-xs text-slate-500">{bid.profiles?.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-slate-700">{bid.lots?.title}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-orange-600">{formatCurrency(bid.amount)}</span>
                      </TableCell>
                      <TableCell className="pr-6 text-slate-500 text-sm">
                        {formatDate(bid.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-slate-400 italic">
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