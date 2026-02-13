"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gavel, Package, Users, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    auctions: 0,
    lots: 0,
    users: 0,
    bids: 0
  });
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
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
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
          <p className="text-slate-500">Métricas em tempo real da plataforma.</p>
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
    </div>
  );
};

export default AdminOverview;