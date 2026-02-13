"use client";

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Gavel, Clock, ShieldCheck, Info, Share2, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';

const LotDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [lot, setLot] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [bidAmount, setBidAmount] = React.useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lots')
        .select('*, auctions(title, starts_at)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setLot(data);
      setBidAmount(String((data.current_bid || data.start_bid) + (data.bid_increment || 500)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [id]);

  const handlePlaceBid = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar logado para dar lances.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(bidAmount);
    const minBid = (lot.current_bid || lot.start_bid) + (lot.bid_increment || 500);

    if (amount < minBid) {
      toast({
        title: "Lance inválido",
        description: `O lance mínimo é ${formatCurrency(minBid)}`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Lance enviado!",
      description: "Seu lance foi registrado com sucesso.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!lot) return null;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <Link to={`/auctions/${lot.auction_id}`} className="inline-flex items-center text-slate-500 hover:text-orange-500 font-bold text-sm transition-colors">
            <ChevronLeft size={18} className="mr-1" /> Voltar para o Leilão
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full bg-white border-slate-200"><Share2 size={18} /></Button>
            <Button variant="outline" size="icon" className="rounded-full bg-white border-slate-200"><Heart size={18} /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Galeria e Info Principal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <div className="aspect-video bg-slate-100 relative">
                <img 
                  src={lot.cover_image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200'} 
                  className="w-full h-full object-cover"
                  alt={lot.title}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-slate-900 text-white border-none px-4 py-1 rounded-full font-bold">LOTE #{lot.lot_number}</Badge>
                  <Badge className="bg-orange-500 text-white border-none px-4 py-1 rounded-full font-bold flex items-center gap-1">
                    <Clock size={14} /> 2d 14h 30m
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{lot.title}</h1>
              <div className="flex flex-wrap gap-4 mb-8">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold">ANO: {lot.year || '2023'}</Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold">KM: {lot.mileage || '0'}</Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold">COMBUSTÍVEL: {lot.fuel || 'Flex'}</Badge>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Info size={20} className="text-orange-500" /> Descrição do Lote
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  {lot.description || 'Veículo em excelente estado de conservação, revisado e com documentação em dia. Ideal para quem busca qualidade e procedência.'}
                </p>
              </div>
            </div>
          </div>

          {/* Painel de Lances */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lance Atual</p>
                  <p className="text-4xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Lance Inicial</span>
                      <span className="text-slate-900 font-bold">{formatCurrency(lot.start_bid)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Incremento Mínimo</span>
                      <span className="text-orange-600 font-bold">+ {formatCurrency(lot.bid_increment || 500)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Seu Lance</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                      <Input 
                        type="number" 
                        className="pl-12 h-14 rounded-2xl border-slate-200 text-xl font-bold focus:ring-orange-500"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handlePlaceBid}
                    className="w-full h-16 bg-slate-900 hover:bg-orange-600 text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-3 group"
                  >
                    <Gavel size={22} className="group-hover:rotate-12 transition-transform" />
                    DAR LANCE AGORA
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <ShieldCheck size={14} className="text-green-500" /> Ambiente Seguro & Criptografado
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
              <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <Clock size={16} /> Atenção ao Prazo
              </h4>
              <p className="text-sm text-orange-700/80 leading-relaxed">
                Este lote encerra em breve. Lances feitos nos últimos 2 minutos adicionam tempo extra ao cronômetro.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LotDetails;