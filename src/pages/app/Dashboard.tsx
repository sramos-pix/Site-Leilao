"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Gavel, Wallet, Heart, 
  Trophy, Bell, ShieldCheck, Loader2,
  ArrowUpRight, Clock, CheckCircle2
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
import AppLayout from '@/components/layout/AppLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<any>(null);
  const [activeBids, setActiveBids] = React.useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = React.useState<any[]>([]);
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
        .select(`
          id, 
          amount, 
          lot_id, 
          created_at, 
          lots ( 
            id, 
            title, 
            cover_image_url, 
            status, 
            ends_at,
            winner_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const uniqueBidsMap = new Map();
      if (bidsData) {
        bidsData.forEach(bid => {
          const lot = Array.isArray(bid.lots) ? bid.lots[0] : bid.lots;
          if (lot && !uniqueBidsMap.has(bid.lot_id)) {
            uniqueBidsMap.set(bid.lot_id, { ...bid, lot_data: lot });
          }
        });
      }
      setActiveBids(Array.from(uniqueBidsMap.values()));

      // 3. Notificações Recentes
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      setRecentNotifications(notifs || []);

      // 4. Estatísticas
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

    // Listener Realtime para Lances e Notificações
    const channel = supabase.channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchDashboardData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboardData]);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      <p className="text-slate-400 font-semibold animate-pulse">Sincronizando dados...</p>
    </div>
  );

  const kycStatus = profile?.kyc_status;
  const hasDocument = !!profile?.document_url;
  
  let statusConfig = {
    label: 'AGUARDANDO ENVIO',
    color: 'bg-rose-600',
    badge: 'text-rose-600',
    description: 'Ação necessária para lances',
    buttonText: 'ENVIAR DOCUMENTOS'
  };

  if (kycStatus === 'verified') {
    statusConfig = {
      label: 'APROVADO',
      color: 'bg-emerald-600',
      badge: 'text-emerald-600',
      description: 'Acesso total liberado',
      buttonText: ''
    };
  } else if (kycStatus === 'rejected') {
    statusConfig = {
      label: 'REJEITADO',
      color: 'bg-red-600',
      badge: 'text-red-600',
      description: 'Documento recusado, envie novamente',
      buttonText: 'REENVIAR DOCUMENTOS'
    };
  } else if (hasDocument) {
    statusConfig = {
      label: 'EM ANÁLISE',
      color: 'bg-orange-500',
      badge: 'text-orange-600',
      description: 'Documentos em verificação',
      buttonText: 'VER DETALHES'
    };
  }

  const stats = [
    { label: 'Lances Ativos', value: activeBids.filter(b => b.lot_data?.status !== 'finished').length, icon: Gavel, color: 'text-blue-600', bg: 'bg-blue-50', path: null },
    { label: 'Arremates', value: winsCount, icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50', path: '/app/wins' },
    { label: 'Favoritos', value: favoritesCount, icon: Heart, color: 'text-red-600', bg: 'bg-red-50', path: '/app/favorites' },
    { label: 'Saldo', value: 'R$ 0', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', path: null },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Olá, {profile?.full_name || 'Usuário'}
            </h1>
            {kycStatus === 'verified' && (
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            className={cn(
              "border-none shadow-sm rounded-2xl bg-white overflow-hidden group hover:shadow-md transition-all duration-300",
              stat.path && "cursor-pointer hover:ring-2 hover:ring-orange-100"
            )}
            onClick={() => stat.path && navigate(stat.path)}
          >
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
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Seus Lances e Arremates</h2>
            <Link to="/auctions" className="text-orange-500 font-bold text-sm flex items-center gap-1 hover:underline">
              Ver todos <ArrowUpRight size={14} />
            </Link>
          </div>
          
          <div className="grid gap-4">
            {activeBids.length > 0 ? activeBids.map((bid) => {
              const lot = bid.lot_data;
              const isWinner = lot?.status === 'finished' && lot?.winner_id === profile?.id;
              const isFinished = lot?.status === 'finished';

              return (
                <Card key={bid.id} className={cn(
                  "border-none shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all group",
                  isWinner && "ring-2 ring-emerald-500/20"
                )}>
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-48 h-32 bg-slate-100 overflow-hidden relative">
                      <img 
                        src={lot?.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt={lot?.title} 
                      />
                      {isWinner && (
                        <div className="absolute inset-0 bg-emerald-600/20 flex items-center justify-center">
                          <Trophy className="text-white drop-shadow-md" size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">{lot?.title}</h3>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {isFinished ? 'Leilão Encerrado' : (lot?.ends_at ? `Expira em ${new Date(lot.ends_at).toLocaleDateString('pt-BR')}` : 'Leilão Ativo')}
                            </span>
                          </div>
                        </div>
                        {isWinner ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={10} /> ARREMATADO
                          </Badge>
                        ) : isFinished ? (
                          <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] px-2 py-0.5 rounded-full">
                            FINALIZADO
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] px-2 py-0.5 rounded-full">
                            EM DISPUTA
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                            {isWinner ? 'Valor de Arremate' : 'Seu Lance Atual'}
                          </p>
                          <p className={cn("font-bold text-xl", isWinner ? "text-emerald-600" : "text-slate-900")}>
                            {formatCurrency(bid.amount)}
                          </p>
                        </div>
                        <Link to={`/lots/${bid.lot_id}`}>
                          <Button className={cn(
                            "rounded-xl font-bold px-5 h-10 text-sm transition-all",
                            isWinner 
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                              : "bg-slate-900 hover:bg-slate-800 text-white"
                          )}>
                            {isWinner ? "Ver Detalhes" : "Aumentar Lance"}
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

        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight px-1">Status da Conta</h2>
          
          <Card className={cn(
            "border-none shadow-lg rounded-2xl overflow-hidden transition-all duration-300 text-white",
            statusConfig.color
          )}>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <ShieldCheck size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Verificação</h3>
                  <p className="text-white/70 text-[10px] font-medium">
                    {statusConfig.description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <span className="text-xs font-bold text-white/80">Status Atual</span>
                  <Badge className={cn(
                    "bg-white border-none font-bold px-3 py-0.5 rounded-full text-[10px] tracking-wider",
                    statusConfig.badge
                  )}>
                    {statusConfig.label}
                  </Badge>
                </div>
                
                {statusConfig.buttonText && (
                  <Link to="/app/verify" className="block">
                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold h-12 text-base shadow-md">
                      {statusConfig.buttonText}
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
              <Link to="/app/notifications" className="text-[10px] font-bold text-orange-500 hover:underline">VER TODAS</Link>
            </div>
            <div className="space-y-5">
              {recentNotifications.length > 0 ? recentNotifications.map((notif) => (
                <div key={notif.id} className="flex gap-3 group cursor-pointer" onClick={() => navigate('/app/notifications')}>
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    notif.read ? "bg-slate-200" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                  )} />
                  <div>
                    <p className={cn(
                      "text-xs font-bold leading-tight mb-1 group-hover:text-orange-500 transition-colors",
                      notif.read ? "text-slate-500" : "text-slate-700"
                    )}>{notif.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma notificação recente.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;