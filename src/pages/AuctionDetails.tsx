"use client";

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Car, Calendar, Gavel, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AuctionDetails = () => {
  const { id } = useParams();
  const [auction, setAuction] = React.useState<any>(null);
  const [lots, setLots] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [id]);

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map((lot) => (
            <Card key={lot.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white">
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                <img 
                  src={lot.cover_image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  alt={lot.title}
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 border-none font-bold px-3 py-0.5 rounded-full text-[10px]">
                    LOTE {lot.lot_number}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-4">{lot.title}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Lance Inicial</span>
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(lot.starting_price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Lance Atual</span>
                    <span className="text-lg font-bold text-orange-600">{formatCurrency(lot.current_price || lot.starting_price)}</span>
                  </div>
                </div>

                <Link to={`/lots/${lot.id}`}>
                  <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white rounded-xl h-11 font-bold group/btn transition-all">
                    Dar Lance <Gavel className="ml-2 h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
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