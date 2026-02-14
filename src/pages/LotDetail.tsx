"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, Clock, Gavel, 
  ShieldCheck, MapPin, Calendar, Gauge, 
  Fuel, Settings2, Loader2, AlertTriangle,
  History, User, TrendingUp, Lock, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, maskEmail, formatDate, cn } from '@/lib/utils';
import { placeBid } from '@/lib/actions';
import { useToast } from '@/components/ui/use-toast';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

const LotDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [lot, setLot] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [activePhoto, setActivePhoto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [realBids, setRealBids] = useState<any[]>([]);

  const fetchLotData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      const { data: lotData, error: lotError } = await supabase
        .from('lots')
        .select('*')
        .eq('id', id)
        .single();

      if (lotError) throw lotError;

      const { data: photosData } = await supabase
        .from('lot_photos')
        .select('*')
        .eq('lot_id', id)
        .order('is_cover', { ascending: false });

      setLot(lotData);
      setPhotos(photosData || []);
      
      if (photosData && photosData.length > 0) {
        setActivePhoto(photosData[0].public_url);
      } else if (lotData.cover_image_url) {
        setActivePhoto(lotData.cover_image_url);
      }

      const currentVal = lotData.current_bid || lotData.start_bid;
      const minIncrement = lotData.bid_increment || 1000;
      setBidAmount(currentVal + minIncrement);

      const { data: bidsData } = await supabase
        .from('bids')
        .select('*')
        .eq('lot_id', id)
        .order('amount', { ascending: false });
      
      setRealBids(bidsData || []);

    } catch (error: any) {
      console.error("Erro ao carregar lote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLotData();
    const channel = supabase
      .channel(`lot-updates-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids', filter: `lot_id=eq.${id}` }, () => fetchLotData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lots', filter: `id=eq.${id}` }, () => fetchLotData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleBid = async () => {
    if (!lot || !user) {
      toast({ title: "Acesso restrito", description: "Faça login para dar lances.", variant: "destructive" });
      return;
    }

    if (lot.status === 'finished') {
      toast({ title: "Leilão Encerrado", description: "Este lote já foi finalizado.", variant: "destructive" });
      return;
    }
    
    const currentVal = lot.current_bid || lot.start_bid;
    if (bidAmount <= currentVal) {
      toast({ title: "Lance inválido", description: "O lance deve ser maior que o valor atual.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await placeBid(lot.id, bidAmount);
      toast({ title: "Lance efetuado com sucesso!" });
      await fetchLotData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allBids = useMemo(() => {
    if (!lot) return [];
    
    const processedRealBids = realBids.map(b => ({
      id: b.id,
      amount: b.amount,
      created_at: b.created_at,
      user_id: b.user_id,
      is_fake: false,
      display_name: b.user_id === user?.id ? "Você" : "Licitante"
    }));

    // Lances simulados para histórico (Prova Social)
    const fakeEmails = ["ca***@gmail.com", "an***@hotmail.com", "ro***@outlook.com", "ju***@yahoo.com"];
    const seed = id ? id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
    const fakes = [];
    
    const currentMax = processedRealBids.length > 0 ? processedRealBids[0].amount : (lot.current_bid || lot.start_bid);
    const startValue = lot.start_bid;
    const increment = lot.bid_increment || 1000;

    for (let i = 0; i < 5; i++) {
      const fakeAmount = startValue + (i * increment * 0.8);
      if (fakeAmount < currentMax && fakeAmount >= startValue) {
        fakes.push({
          id: `fake-${i}-${id}`,
          amount: fakeAmount,
          created_at: new Date(Date.now() - (i + 1) * 7200000).toISOString(),
          is_fake: true,
          display_name: fakeEmails[(seed + i) % fakeEmails.length]
        });
      }
    }

    return [...processedRealBids, ...fakes].sort((a, b) => b.amount - a.amount);
  }, [realBids, lot, id, user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>;
  if (!lot) return <div className="text-center py-20">Lote não encontrado.</div>;

  const isFinished = lot.status === 'finished';
  const isWinner = user && lot.winner_id === user.id;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-4">
        <Link to="/auctions" className="inline-flex items-center text-sm text-slate-500 hover:text-orange-600 mb-6 font-bold">
          <ChevronLeft size={16} className="mr-1" /> VOLTAR PARA LEILÕES
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-200 border-4 border-white relative group">
                <img src={activePhoto} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                {isFinished && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-8 rounded-3xl text-center shadow-2xl transform -rotate-2">
                      <Lock className="mx-auto text-orange-500 mb-2" size={40} />
                      <h2 className="text-3xl font-black text-slate-900 uppercase">Lote Encerrado</h2>
                      <p className="text-slate-500 font-bold">Este veículo já foi arrematado</p>
                    </div>
                  </div>
                )}
              </div>
              {photos.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {photos.map((photo) => (
                    <button key={photo.id} onClick={() => setActivePhoto(photo.public_url)} className={`shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activePhoto === photo.public_url ? 'border-orange-500' : 'border-transparent opacity-70'}`}>
                      <img src={photo.public_url} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
              
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <Badge className={`mb-3 border-none px-4 py-1 rounded-full font-bold ${isFinished ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-600'}`}>
                    {isFinished ? 'LEILÃO FINALIZADO' : `LOTE #${lot.lot_number}`}
                  </Badge>
                  <h1 className="text-3xl font-black text-slate-900">{lot.title}</h1>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-100">
                <div className="space-y-1"><div className="flex items-center gap-2 text-slate-400 mb-1"><Gauge size={16} /><span className="text-[10px] font-black">KM</span></div><p className="font-bold">{lot.mileage_km?.toLocaleString()} km</p></div>
                <div className="space-y-1"><div className="flex items-center gap-2 text-slate-400 mb-1"><Calendar size={16} /><span className="text-[10px] font-black">ANO</span></div><p className="font-bold">{lot.year}</p></div>
                <div className="space-y-1"><div className="flex items-center gap-2 text-slate-400 mb-1"><Settings2 size={16} /><span className="text-[10px] font-black">CÂMBIO</span></div><p className="font-bold">{lot.transmission || 'Automático'}</p></div>
                <div className="space-y-1"><div className="flex items-center gap-2 text-slate-400 mb-1"><Fuel size={16} /><span className="text-[10px] font-black">MOTOR</span></div><p className="font-bold">{lot.fuel_type || 'Flex'}</p></div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Descrição do Lote</h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">{lot.description || "Sem descrição."}</div>
              </div>
            </div>

            {/* HISTÓRICO DE LANCES - RESTAURADO */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <History className="text-orange-500" /> Histórico de Lances
                </h3>
                <Badge variant="outline" className="rounded-full border-slate-200 text-slate-400 font-bold">
                  {allBids.length} lances realizados
                </Badge>
              </div>

              <div className="space-y-4">
                {allBids.length > 0 ? allBids.map((bid, idx) => (
                  <div 
                    key={bid.id} 
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl transition-all border",
                      idx === 0 ? "bg-orange-50 border-orange-100 shadow-sm" : "bg-white border-slate-50",
                      bid.user_id === user?.id ? "border-l-4 border-l-orange-500" : ""
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        idx === 0 ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-2">
                          {bid.display_name}
                          {idx === 0 && <Badge className="bg-orange-500 text-[8px] h-4 px-1.5">LÍDER</Badge>}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">{formatDate(bid.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-black text-lg", idx === 0 ? "text-orange-600" : "text-slate-900")}>
                        {formatCurrency(bid.amount)}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                    <TrendingUp className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-400 font-bold">Nenhum lance ainda. Seja o primeiro!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            {isFinished ? (
              <Card className={`border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-24 ${isWinner ? 'bg-green-600 text-white' : 'bg-slate-900 text-white'}`}>
                <CardContent className="p-8 text-center space-y-6">
                  {isWinner ? (
                    <>
                      <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={40} />
                      </div>
                      <h3 className="text-2xl font-black">Você Venceu!</h3>
                      <p className="text-green-100">Parabéns! Seu lance foi o vencedor. Verifique suas notificações para os próximos passos.</p>
                      <div className="bg-white/10 p-6 rounded-3xl">
                        <p className="text-xs uppercase font-bold opacity-70 mb-1">Valor de Arremate</p>
                        <p className="text-3xl font-black">{formatCurrency(lot.current_bid)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Lock size={40} className="text-orange-500" />
                      </div>
                      <h3 className="text-2xl font-black">Lote Arrematado</h3>
                      <p className="text-slate-400">Este veículo não aceita mais novos lances.</p>
                      <Link to="/auctions" className="block">
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-2xl h-14">Ver Outros Lotes</Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-24">
                <div className="bg-slate-900 p-8 text-white text-center">
                  <div className="flex items-center justify-center gap-2 text-orange-500 mb-3"><Clock size={20} /><span className="text-xs font-black uppercase">Tempo Restante</span></div>
                  <CountdownTimer endsAt={lot.ends_at} randomScarcity={true} lotId={lot.id} />
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center bg-slate-50 py-6 rounded-3xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Lance Atual</p>
                      <p className="text-xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                    </div>
                    <div className="text-center bg-orange-50 py-6 rounded-3xl border border-orange-100">
                      <p className="text-[10px] text-orange-400 uppercase font-black mb-1">Incremento</p>
                      <p className="text-xl font-black text-orange-600">+ {formatCurrency(lot.bid_increment || 1000)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-slate-500 font-bold text-xs uppercase ml-1">Seu Lance</Label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">R$</span>
                        <input 
                          type="number" 
                          value={bidAmount} 
                          onChange={(e) => setBidAmount(Number(e.target.value))} 
                          className="w-full text-2xl font-black h-20 pl-16 text-center rounded-3xl border-2 border-slate-100 focus:border-orange-500 outline-none" 
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleBid} 
                      disabled={isSubmitting} 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white h-20 rounded-3xl text-xl font-black shadow-lg shadow-orange-200 transition-all active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'CONFIRMAR LANCE'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotDetail;