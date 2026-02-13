"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gavel, Wallet, Heart, 
  Trophy, User, Bell, ChevronRight,
  AlertCircle, ShieldCheck, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const [profile, setProfile] = React.useState<any>(null);
  const [activeBids, setActiveBids] = React.useState<any[]>([]);
  const [favoritesCount, setFavoritesCount] = React.useState(0);
  const [winsCount, setWinsCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // 2. Lances Ativos
      const { data: bidsData } = await supabase
        .from('bids')
        .select(`id, amount, lot_id, created_at, lots ( id, title, cover_image_url, status, ends_at )`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const now = new Date();
      const filteredBids = bidsData?.filter(b => {
        const lot = Array.isArray(b.lots) ? b.lots[0] : b.lots;
        return lot && new Date(lot.ends_at) > now && lot.status !== 'finished';
      }) || [];
      
      setActiveBids(filteredBids);

      // 3. Vitórias via RPC
      const { data: wins, error: winsError } = await supabase.rpc("get_user_wins", { p_user: user.id });
      if (!winsError) {
        setWinsCount(wins?.length || 0);
      }

      // 4. Favoritos
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setFavoritesCount(count || 0);

    } catch (error) {
      console.error("Erro Dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
    
    const channel = supabase
      .channel('dashboard-realtime-v4')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lots' }, () => fetchDashboardData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboardData]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-10 w-10 animate-spin text-orange-500" /></div>;

  const stats = [
    { label: 'Lances Ativos', value: activeBids.length.toString(), icon: Gavel, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Vitórias', value: winsCount.toString().padStart(2, '0'), icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Favoritos', value: favoritesCount.toString().padStart(2, '0'), icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Saldo Depósito', value: 'R$ 0,00', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900">Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}</h1>
              {profile?.kyc_status === 'verified' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><ShieldCheck className="text-green-500" size={24} /></TooltipTrigger>
                    <TooltipContent className="bg-slate-900 text-white border-none rounded-lg"><p>Perfil Verificado</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-slate-500 font-medium">Gerencie seus lances e arremates.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/app/profile"><Button variant="outline" className="rounded-xl border-slate-200 font-bold">Perfil</Button></Link>
            <Link to="/auctions"><Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold">Ver Leilões</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8">
                <div className={`p-4 rounded-2xl ${stat.bg} w-fit mb-6`}><stat.icon className={stat.color} size={28} /></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Lances em Andamento</h2>
              <Link to="/auctions" className="text-orange-500 text-sm font-bold hover:underline">Ver todos</Link>
            </div>
            
            <div className="grid gap-4">
              {activeBids.length > 0 ? activeBids.map((bid) => {
                const lot = Array.isArray(bid.lots) ? bid.lots[0] : bid.lots;
                return (
                  <Card key={bid.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden hover:shadow-md transition-all bg-white">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="w-full sm:w-40 h-32 bg-slate-100">
                        <img src={lot?.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} className="w-full h-full object-cover" alt={lot?.title} />
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-900 line-clamp-1">{lot?.title}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Lote {lot?.id?.substring(0, 5)}</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-600 border-none font-bold text-[10px]">EM DISPUTA</Badge>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400">Seu Lance</p>
                            <p className="font-black text-slate-900">{formatCurrency(bid.amount)}</p>
                          </div>
                          <Link to={`/lots/${bid.lot_id}`}><Button size="sm" className="rounded-xl bg-slate-900 text-white font-bold">Dar novo lance</Button></Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <Gavel className="mx-auto text-slate-200 mb-4" size={40} />
                  <p className="text-slate-400 font-medium">Nenhum lance ativo no momento.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-xl font-black text-slate-900">Status da Conta</h2>
            
            <Card className={cn(
              "border-none shadow-lg rounded-[2.5rem] overflow-hidden",
              profile?.kyc_status === 'verified' ? "bg-slate-900 text-white" : "bg-orange-500 text-white"
            )}>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Verificação</h3>
                    <p className="text-white/70 text-xs">
                      {profile?.kyc_status === 'verified' ? 'Sua conta está liberada.' : 'Ação necessária para lances.'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Status:</span>
                    <span className="uppercase tracking-wider">
                      {profile?.kyc_status === 'verified' ? 'Aprovado' : profile?.kyc_status === 'pending' ? 'Em Análise' : 'Pendente'}
                    </span>
                  </div>
                  {profile?.kyc_status !== 'verified' && (
                    <Link to="/app/verify">
                      <Button className="w-full mt-4 bg-white text-orange-600 hover:bg-slate-100 rounded-2xl font-black h-14">
                        {profile?.kyc_status === 'pending' ? 'VER DETALHES' : 'ENVIAR DOCUMENTOS'}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Bell size={18} className="text-orange-500" /> Notificações
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3 pb-4 border-b border-slate-50">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed">Bem-vindo ao novo painel AutoBid! Explore as oportunidades.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;