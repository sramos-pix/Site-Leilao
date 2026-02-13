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
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const [profile, setProfile] = React.useState<any>(null);
  const [activeBids, setActiveBids] = React.useState<any[]>([]);
  const [favoritesCount, setFavoritesCount] = React.useState(0);
  const [winsCount, setWinsCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Busca Perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      // Busca Lances Ativos
      const { data: bidsData } = await supabase
        .from('bids')
        .select(`id, amount, lot_id, created_at, lots ( id, title, cover_image_url, status, winner_id )`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setActiveBids(bidsData?.filter(b => b.lots) || []);

      // Busca Vitórias via RPC (com fallback para 0 se a RPC falhar)
      const { data: wins, error: winsError } = await supabase.rpc("get_user_wins", { p_user: user.id });
      if (!winsError) {
        setWinsCount(wins?.length || 0);
      } else {
        console.warn("RPC get_user_wins falhou ou não existe:", winsError);
        setWinsCount(0);
      }

      // Busca Contagem de Favoritos
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setFavoritesCount(count || 0);

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
    
    const channel = supabase
      .channel('dashboard-realtime-v3')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lots' }, () => fetchDashboardData())
      .subscribe();

    return () => { 
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;

  const stats = [
    { label: 'Lances Ativos', value: activeBids.length.toString(), icon: Gavel, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Vitórias', value: winsCount.toString().padStart(2, '0'), icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Favoritos', value: favoritesCount.toString().padStart(2, '0'), icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Saldo Depósito', value: 'R$ 0,00', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900">Olá, {profile?.full_name || 'Usuário'}</h1>
              {profile?.kyc_status === 'verified' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><ShieldCheck className="text-green-500 cursor-help" size={24} /></TooltipTrigger>
                    <TooltipContent className="bg-slate-900 text-white border-none rounded-lg"><p>Perfil Aprovado!</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-slate-500">Bem-vindo ao seu painel de controle.</p>
          </div>
          <Link to="/app/profile"><Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"><User size={20} className="mr-2" /> Meu Perfil</Button></Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${stat.bg} w-fit mb-4`}><stat.icon className={stat.color} size={24} /></div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Seus Lances Recentes</h2>
            <div className="space-y-4">
              {activeBids.length > 0 ? activeBids.map((bid) => {
                const isFinished = bid.lots?.status === 'finished';
                const isWinner = bid.lots?.winner_id === profile?.id;

                return (
                  <Card key={bid.id} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 h-32 bg-slate-200">
                        <img src={bid.lots?.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} className="w-full h-full object-cover" alt={bid.lots?.title} />
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div><h3 className="font-bold text-slate-900">{bid.lots?.title}</h3><p className="text-xs text-slate-500">Lote {bid.lot_id}</p></div>
                          {isFinished ? (
                            <Badge className={isWinner ? "bg-orange-100 text-orange-600 border-none" : "bg-slate-100 text-slate-600 border-none"}>
                              {isWinner ? 'Arrematado' : 'Finalizado'}
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-600 border-none">Ativo</Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div><p className="text-[10px] uppercase font-bold text-slate-400">Seu Lance</p><p className="font-bold text-slate-900">{formatCurrency(bid.amount)}</p></div>
                          <Link to={`/lots/${bid.lot_id}`}><Button size="sm" variant="outline" className="rounded-lg">Ver Lote</Button></Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                  <Gavel className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500">Você ainda não deu nenhum lance.</p>
                  <Link to="/"><Button variant="link" className="text-orange-500 font-bold">Explorar Leilões</Button></Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Ações Rápidas</h2>
            <Link to="/app/verify">
              <Button className="w-full justify-between bg-white text-slate-900 hover:bg-slate-50 border-none shadow-sm h-14 rounded-xl px-6">
                <span className="flex items-center gap-3"><ShieldCheck className="text-orange-500" size={20} /> Validar Documentos</span>
                <ChevronRight size={16} className="text-slate-400" />
              </Button>
            </Link>

            {profile?.kyc_status !== 'verified' && (
              <Card className="border-none shadow-sm rounded-2xl bg-slate-900 text-white">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertCircle className="text-orange-500" size={20} /> Aviso Importante</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {!profile?.kyc_status ? 'Seu perfil ainda não foi verificado. Envie seus documentos para poder participar de leilões.' : profile?.kyc_status === 'pending' ? 'Seus documentos estão em análise.' : 'Seu documento foi rejeitado.'}
                  </p>
                  {(!profile?.kyc_status || profile?.kyc_status === 'rejected') && (
                    <Link to="/app/verify"><Button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl">Enviar Documentos</Button></Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;