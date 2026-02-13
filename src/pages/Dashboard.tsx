"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gavel, Wallet, Heart, 
  Trophy, Bell, ShieldCheck, Loader2,
  ArrowUpRight, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

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

      const { data: wins } = await supabase.rpc("get_user_wins", { p_user: user.id });
      setWinsCount(wins?.length || 0);

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
    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lots' }, () => fetchDashboardData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboardData]);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      <p className="text-slate-400 font-bold animate-pulse">Sincronizando dados...</p>
    </div>
  );

  const stats = [
    { label: 'Lances Ativos', value: activeBids.length, icon: Gavel, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Arremates', value: winsCount, icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Favoritos', value: favoritesCount, icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Saldo', value: 'R$ 0', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      <div className="container mx-auto px-4 pt-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Olá, {profile?.full_name || 'Usuário'}
              </h1>
              {profile?.kyc_status === 'verified' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-emerald-100 p-1.5 rounded-full">
                        <ShieldCheck className="text-emerald-600" size={20} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 text-white border-none rounded-xl font-bold">
                      <p>Conta Verificada</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-slate-500 text-lg font-medium">Bem-vindo ao seu centro de controle AutoBid.</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Link to="/app/profile" className="flex-1 lg:flex-none">
              <Button variant="outline" className="w-full rounded-2xl border-slate-200 h-14 px-8 font-bold text-slate-600 hover:bg-white hover:shadow-md transition-all">
                Meu Perfil
              </Button>
            </Link>
            <Link to="/auctions" className="flex-1 lg:flex-none">
              <Button className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 text-white h-14 px-8 font-black shadow-lg shadow-orange-100 transition-all">
                Explorar Leilões
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-xl transition-all duration-500">
              <CardContent className="p-6 lg:p-8">
                <div className={cn("p-4 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110 duration-500", stat.bg)}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value.toString().padStart(2, '0')}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Active Bids */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lances em Andamento</h2>
              <Link to="/auctions" className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:underline">
                Ver todos <ArrowUpRight size={16} />
              </Link>
            </div>
            
            <div className="grid gap-4">
              {activeBids.length > 0 ? activeBids.map((bid) => {
                const lot = Array.isArray(bid.lots) ? bid.lots[0] : bid.lots;
                return (
                  <Card key={bid.id} className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:shadow-md transition-all group">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="w-full sm:w-56 h-40 bg-slate-100 overflow-hidden">
                        <img 
                          src={lot?.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt={lot?.title} 
                        />
                      </div>
                      <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-black text-slate-900 text-lg line-clamp-1 mb-1">{lot?.title}</h3>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock size={14} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Expira em {new Date(lot?.ends_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-3 py-1 rounded-full">
                            EM DISPUTA
                          </Badge>
                        </div>
                        <div className="flex justify-between items-end mt-6">
                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Seu Lance Atual</p>
                            <p className="font-black text-slate-900 text-2xl">{formatCurrency(bid.amount)}</p>
                          </div>
                          <Link to={`/lots/${bid.lot_id}`}>
                            <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 h-12">
                              Aumentar Lance
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Gavel className="text-slate-200" size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum lance ativo</h3>
                  <p className="text-slate-400 font-medium mb-8">Você ainda não deu lances em leilões abertos.</p>
                  <Link to="/auctions">
                    <Button variant="outline" className="rounded-xl border-slate-200 font-bold px-8">Começar a Lançar</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Account Status & Notifications */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight px-2">Status da Conta</h2>
            
            <Card className={cn(
              "border-none shadow-xl rounded-[3rem] overflow-hidden transition-all duration-500",
              profile?.kyc_status === 'verified' ? "bg-slate-900 text-white" : "bg-orange-500 text-white"
            )}>
              <CardContent className="p-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="bg-white/20 p-5 rounded-[1.5rem] backdrop-blur-sm">
                    <ShieldCheck size={32} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl">Verificação</h3>
                    <p className="text-white/70 text-xs font-medium">
                      {profile?.kyc_status === 'verified' ? 'Acesso total liberado' : 'Ação necessária para lances'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                    <span className="text-sm font-bold text-white/80">Status Atual</span>
                    <Badge className={cn(
                      "border-none font-black px-4 py-1 rounded-full text-[10px] tracking-widest",
                      profile?.kyc_status === 'verified' ? "bg-emerald-500 text-white" : "bg-white text-orange-600"
                    )}>
                      {profile?.kyc_status === 'verified' ? 'APROVADO' : profile?.kyc_status === 'pending' ? 'EM ANÁLISE' : 'PENDENTE'}
                    </Badge>
                  </div>
                  
                  {profile?.kyc_status !== 'verified' && (
                    <Link to="/app/verify" className="block">
                      <Button className="w-full bg-white text-orange-600 hover:bg-slate-100 rounded-[1.5rem] font-black h-16 text-lg shadow-lg">
                        {profile?.kyc_status === 'pending' ? 'VER DETALHES' : 'ENVIAR DOCUMENTOS'}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 text-xl flex items-center gap-3">
                  <Bell size={22} className="text-orange-500" /> Notificações
                </h3>
                <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[10px]">1 NOVA</Badge>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mt-2 shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  <div>
                    <p className="text-sm text-slate-700 font-bold leading-tight mb-1 group-hover:text-orange-500 transition-colors">Bem-vindo ao AutoBid!</p>
                    <p className="text-xs text-slate-400 font-medium">Sua conta foi criada com sucesso. Complete seu perfil para começar.</p>
                  </div>
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