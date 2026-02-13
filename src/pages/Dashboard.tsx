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
      <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      <p className="text-slate-400 font-semibold animate-pulse">Sincronizando dados...</p>
    </div>
  );

  const stats = [
    { label: 'Lances Ativos', value: activeBids.length, icon: Gavel, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Arremates', value: winsCount, icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Favoritos', value: favoritesCount, icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Saldo', value: 'R$ 0', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      <div className="container mx-auto px-4 pt-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Olá, {profile?.full_name || 'Usuário'}
              </h1>
              {profile?.kyc_status === 'verified' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-emerald-100 p-1 rounded-full">
                        <ShieldCheck className="text-emerald-600" size={16} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 text-white border-none rounded-lg font-bold">
                      <p>Conta Verificada</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-slate-500 font-medium">Bem-vindo ao seu centro de controle AutoBid.</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Link to="/app/profile" className="flex-1 lg:flex-none">
              <Button variant="outline" className="w-full rounded-xl border-slate-200 h-11 px-6 font-semibold text-slate-600 hover:bg-white hover:shadow-sm transition-all">
                Meu Perfil
              </Button>
            </Link>
            <Link to="/auctions" className="flex-1 lg:flex-none">
              <Button className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white h-11 px-6 font-bold shadow-md shadow-orange-100 transition-all">
                Explorar Leilões
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
              <CardContent className="p-5 lg:p-6">
                <div className={cn("p-3 rounded-xl w-fit mb-4 transition-transform group-hover:scale-105 duration-300", stat.bg)}>
                  <stat.icon className={stat.color} size={20} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value.toString().padStart(2, '0')}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Active Bids */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lances em Andamento</h2>
              <Link to="/auctions" className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:underline">
                Ver todos <ArrowUpRight size={14} />
              </Link>
            </div>
            
            <div className="grid gap-4">
              {activeBids.length > 0 ? activeBids.map((bid) => {
                const lot = Array.isArray(bid.lots) ? bid.lots[0] : bid.lots;
                return (
                  <Card key={bid.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all group">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 h-32 bg-slate-100 overflow-hidden">
                        <img 
                          src={lot?.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt={lot?.title} 
                        />
                      </div>
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">{lot?.title}</h3>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock size={12} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Expira em {new Date(lot?.ends_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] px-2 py-0.5 rounded-full">
                            EM DISPUTA
                          </Badge>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Seu Lance Atual</p>
                            <p className="font-bold text-slate-900 text-xl">{formatCurrency(bid.amount)}</p>
                          </div>
                          <Link to={`/lots/${bid.lot_id}`}>
                            <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 h-10 text-sm">
                              Aumentar Lance
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gavel className="text-slate-200" size={32} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Nenhum lance ativo</h3>
                  <p className="text-slate-400 text-sm font-medium mb-6">Você ainda não deu lances em leilões abertos.</p>
                  <Link to="/auctions">
                    <Button variant="outline" className="rounded-xl border-slate-200 font-bold px-6 h-10 text-sm">Começar a Lançar</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Account Status & Notifications */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight px-1">Status da Conta</h2>
            
            <Card className={cn(
              "border-none shadow-lg rounded-2xl overflow-hidden transition-all duration-300",
              profile?.kyc_status === 'verified' ? "bg-slate-900 text-white" : "bg-orange-500 text-white"
            )}>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <ShieldCheck size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Verificação</h3>
                    <p className="text-white/70 text-[10px] font-medium">
                      {profile?.kyc_status === 'verified' ? 'Acesso total liberado' : 'Ação necessária para lances'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <span className="text-xs font-bold text-white/80">Status Atual</span>
                    <Badge className={cn(
                      "border-none font-bold px-3 py-0.5 rounded-full text-[10px] tracking-wider",
                      profile?.kyc_status === 'verified' ? "bg-emerald-500 text-white" : "bg-white text-orange-600"
                    )}>
                      {profile?.kyc_status === 'verified' ? 'APROVADO' : profile?.kyc_status === 'pending' ? 'EM ANÁLISE' : 'PENDENTE'}
                    </Badge>
                  </div>
                  
                  {profile?.kyc_status !== 'verified' && (
                    <Link to="/app/verify" className="block">
                      <Button className="w-full bg-white text-orange-600 hover:bg-slate-100 rounded-xl font-bold h-12 text-base shadow-md">
                        {profile?.kyc_status === 'pending' ? 'VER DETALHES' : 'ENVIAR DOCUMENTOS'}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Bell size={18} className="text-orange-500" /> Notificações
                </h3>
                <Badge className="bg-orange-50 text-orange-600 border-none font-bold text-[10px]">1 NOVA</Badge>
              </div>
              <div className="space-y-5">
                <div className="flex gap-3 group cursor-pointer">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                  <div>
                    <p className="text-xs text-slate-700 font-bold leading-tight mb-1 group-hover:text-orange-500 transition-colors">Bem-vindo ao AutoBid!</p>
                    <p className="text-[10px] text-slate-400 font-medium">Sua conta foi criada com sucesso. Complete seu perfil para começar.</p>
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