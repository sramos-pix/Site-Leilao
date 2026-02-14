"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Car, Calendar, Gavel, Loader2, Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import { useToast } from '@/components/ui/use-toast';

const AuctionDetails = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState<any>(null);
  const [lots, setLots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: auctionData } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', id)
        .single();
      
      setAuction(auctionData);

      const { data: lotsData } = await supabase
        .from('lots')
        .select('*')
        .eq('auction_id', id)
        .order('lot_number', { ascending: true });
      
      setLots(lotsData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: favs } = await supabase
          .from('favorites')
          .select('lot_id')
          .eq('user_id', user.id);
        setUserFavorites(favs?.map(f => f.lot_id) || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const toggleFavorite = async (e: React.MouseEvent, lotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar logado para favoritar.",
        variant: "destructive"
      });
      return;
    }

    const isFavorited = userFavorites.includes(lotId);
    try {
      if (isFavorited) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('lot_id', lotId);
        setUserFavorites(prev => prev.filter(id => id !== lotId));
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, lot_id: lotId });
        setUserFavorites(prev => [...prev, lotId]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Leilão não encontrado</h2>
        <Link to="/auctions">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">Voltar para Leilões</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <Link to="/auctions" className="inline-flex items-center text-slate-500 hover:text-orange-500 font-bold text-sm mb-6 transition-colors">
          <ChevronLeft size={18} className="mr-1" /> Voltar para Leilões
        </Link>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden bg-slate-100">
              <img 
                src={auction.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'} 
                className="w-full h-full object-cover"
                alt={auction.title}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={auction.status === 'live' ? "bg-red-500 animate-pulse" : "bg-blue-500"}>
                  {auction.status === 'live' ? 'AO VIVO' : 'AGENDADO'}
                </Badge>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">ID: {auction.id.slice(0, 8)}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{auction.title}</h1>
              <p className="text-slate-500 leading-relaxed">{auction.description || 'Confira todos os veículos disponíveis neste leilão exclusivo.'}</p>
              
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-500"><Calendar size={18} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Data de Início</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(auction.starts_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-500"><Car size={18} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total de Lotes</p>
                    <p className="text-sm font-bold text-slate-700">{lots.length} veículos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Veículos Disponíveis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lots.map((lot) => (
            <Card key={lot.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
              <Link to={`/lots/${lot.id}`} className="block relative aspect-[4/3] overflow-hidden cursor-pointer">
                <img 
                  src={lot.cover_image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'} 
                  alt={lot.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-slate-900/90 backdrop-blur-md text-white border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                    LOTE #{lot.lot_number}
                  </Badge>
                  <Badge className="bg-red-500 text-white border-none px-3 py-1 flex items-center gap-1 rounded-full text-[10px] font-black shadow-lg shadow-red-500/20 w-fit">
                    <Clock size={12} /> 
                    <CountdownTimer randomScarcity={true} lotId={lot.id} />
                  </Badge>
                </div>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className={cn(
                    "absolute top-4 right-4 rounded-full backdrop-blur-md border-none shadow-sm transition-all duration-300 z-10",
                    userFavorites.includes(lot.id) ? "bg-red-500 text-white" : "bg-white/90 hover:bg-orange-500 hover:text-white"
                  )}
                  onClick={(e) => toggleFavorite(e, lot.id)}
                >
                  <Heart size={18} fill={userFavorites.includes(lot.id) ? "currentColor" : "none"} />
                </Button>
              </Link>

              <CardContent className="p-8">
                <Link to={`/lots/${lot.id}`}>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {lot.title}
                  </h3>
                </Link>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Lance Atual</p>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.starting_price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Incremento</p>
                    <p className="text-sm font-bold text-slate-600">+ {formatCurrency(lot.bid_increment || 500)}</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-8 pt-0">
                <Link to={`/lots/${lot.id}`} className="w-full">
                  <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white font-black py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-xl shadow-slate-200">
                    <Gavel size={18} className="group-hover/btn:rotate-12 transition-transform" />
                    DAR LANCE AGORA
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {lots.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100">
            <Car className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900">Nenhum veículo cadastrado</h3>
            <p className="text-slate-400">Este leilão ainda não possui lotes disponíveis para lances.</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default AuctionDetails;