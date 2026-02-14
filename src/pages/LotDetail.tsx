"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, Clock, Gavel, 
  ShieldCheck, MapPin, Calendar, Gauge, 
  Fuel, Settings2, Loader2, AlertTriangle,
  History, User, TrendingUp, Lock, CheckCircle2,
  ArrowUpRight, Trophy, Info
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
        .select('*, auctions(title, starts_at)')
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

    const fakeEmails = ["ca***@gmail.com", "an***@hotmail.com", "ro***@outlook.com", "ju***@yahoo.com", "ma***@gmail.com"];
    const seed = id ? id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
    const fakes = [];
    
    const currentMax = processedRealBids.length > 0 ? processedRealBids[0].amount : (lot.current_bid || lot.start_bid);
    const startValue = lot.start_bid;
    const increment = lot.bid_increment || 1000;

    for (let i = 0; i < 6; i++) {
      const fakeAmount = startValue + (i * increment * 1.2);
      if (fakeAmount < currentMax && fakeAmount >= startValue) {
        fakes.push({
          id: `fake-${i}-${id}`,
          amount: fakeAmount,
          created_at: new Date(Date.now() - (i + 1) * 3600000 * 2).toISOString(),
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
          <div className="lg:col-span-8 space-y-8">
            {/* Galeria Principal */}
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl bg-slate-200 border-8 border-white relative group">
                <img src={activePhoto} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {isFinished && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-20">
                    <div className="bg-white p-10 rounded-[2.5rem] text-center shadow-2xl transform -rotate-1">
                      <Trophy className="mx-auto text-orange-500 mb-4" size={56} />
                      <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Lote Encerrado</h2>
                      <p className="text-slate-500 font-bold mt-2">Este veículo já foi arrematado</p>
                    </div>
                  </div>
                )}
              </div>
              {photos.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2">
                  {photos.map((photo) => (
                    <button 
                      key={photo.id} 
                      onClick={() => setActivePhoto(photo.public_url)} 
                      className={cn(
                        "shrink-0 w-28 h-28 rounded-[1.5rem] overflow-hidden border-4 transition-all duration-300",
                        activePhoto === photo.public_url ? 'border-orange-500 scale-95 shadow-lg' : 'border-white opacity-60 hover:opacity-100'
                      )}
                    >
                      <img src={photo.public_url} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
              
            {/* Informações do Veículo */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={cn(
                      "border-none px-5 py-1.5 rounded-full font-black text-[10px] tracking-widest",
                      isFinished ? 'bg-slate-100 text-slate-500' : 'bg-orange-500 text-white'
                    )}>
                      {isFinished ? 'FINALIZADO' : `LOTE #${lot.lot_number}`}
                    </Badge>
                    {!isFinished && (
                      <Badge variant="outline" className="border-orange-200 text-orange-600 font-bold px-4 py-1 rounded-full text-[10px]">
                        AO VIVO
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{lot.title}</h1>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-slate-100 text-slate-400 hover:text-orange-500">
                    <Heart size={20} />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-slate-100 text-slate-400 hover:text-orange-500">
                    <Share2 size={20} />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-slate-50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Gauge size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Quilometragem</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">{lot.mileage_km?.toLocaleString()} km</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ano Modelo</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">{lot.year}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Settings2 size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Câmbio</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">{lot.transmission || 'Automático'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Fuel size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Motor</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">{lot.fuel_type || 'Flex'}</p>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Info size={24} className="text-orange-500" /> Descrição Técnica
                </h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                  {lot.description || "Veículo periciado com laudo cautelar aprovado. Excelente estado de conservação mecânica e estética."}
                </div>
              </div>
            </div>

            {/* Histórico de Lances Premium */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <History className="text-orange-500" size={28} /> Histórico de Lances
                  </h3>
                  <p className="text-slate-400 text-sm font-medium">Acompanhe a disputa em tempo real</p>
                </div>
                <Badge className="bg-slate-900 text-white px-5 py-2 rounded-full font-black text-xs">
                  {allBids.length} LANCES
                </Badge>
              </div>

              <div className="space-y-4">
                {allBids.length > 0 ? allBids.map((bid, idx) => (
                  <div 
                    key={bid.id} 
                    className={cn(
                      "flex items-center justify-between p-6 rounded-[2rem] transition-all duration-500 border-2",
                      idx === 0 
                        ? "bg-orange-50 border-orange-200 shadow-lg shadow-orange-100/50 scale-[1.02]" 
                        : "bg-white border-slate-50 hover:border-slate-100",
                      bid.user_id === user?.id ? "border-l-8 border-l-orange-500" : ""
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                        idx === 0 ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        <User size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-slate-900 text-lg">
                            {bid.display_name}
                          </p>
                          {idx === 0 && (
                            <Badge className="bg-orange-500 text-[10px] font-black px-3 py-0.5 rounded-full animate-pulse">
                              LANCE VENCEDOR
                            </Badge>
                          )}
                          {bid.user_id === user?.id && (
                            <Badge variant="outline" className="border-orange-200 text-orange-600 text-[10px] font-black px-3 py-0.5 rounded-full">
                              VOCÊ
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                          <Clock size={12} /> {formatDate(bid.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-black text-2xl tracking-tight",
                        idx === 0 ? "text-orange-600" : "text-slate-900"
                      )}>
                        {formatCurrency(bid.amount)}
                      </p>
                      {idx === 0 && (
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">Liderando</p>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                    <TrendingUp className="mx-auto text-slate-200 mb-4" size={48} />
                    <h4 className="text-xl font-black text-slate-400">Nenhum lance registrado</h4>
                    <p className="text-slate-300 font-bold mt-2">Seja o primeiro a dar um lance neste veículo!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Painel de Lances Lateral */}
          <div className="lg:col-span-4">
            {isFinished ? (
              <Card className={cn(
                "border-none shadow-2xl rounded-[3rem] overflow-hidden sticky top-24",
                isWinner ? 'bg-green-600 text-white' : 'bg-slate-900 text-white'
              )}>
                <CardContent className="p-10 text-center space-y-8">
                  {isWinner ? (
                    <>
                      <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Trophy size={48} className="text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black tracking-tight">Você Venceu!</h3>
                        <p className="text-green-100 font-medium">Parabéns! O veículo é seu. Siga as instruções de pagamento no seu painel.</p>
                      </div>
                      <div className="bg-white/10 p-8 rounded-[2rem] backdrop-blur-sm">
                        <p className="text-[10px] uppercase font-black opacity-70 mb-2 tracking-widest">Valor Final</p>
                        <p className="text-4xl font-black">{formatCurrency(lot.current_bid)}</p>
                      </div>
                      <Link to="/app/history" className="block">
                        <Button className="w-full bg-white text-green-600 hover:bg-slate-100 rounded-2xl h-16 font-black text-lg shadow-xl">
                          PAGAR AGORA
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                        <Lock size={48} className="text-orange-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black tracking-tight">Encerrado</h3>
                        <p className="text-slate-400 font-medium">Este lote não aceita mais novos lances.</p>
                      </div>
                      <Link to="/auctions" className="block">
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-2xl h-16 font-black">
                          VER OUTROS LEILÕES
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden sticky top-24 bg-white">
                <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <div className="flex items-center justify-center gap-3 text-orange-500 mb-4">
                    <Clock size={24} className="animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest">Tempo Restante</span>
                  </div>
                  <div className="text-4xl font-black tracking-tighter">
                    <CountdownTimer endsAt={lot.ends_at} randomScarcity={true} lotId={lot.id} />
                  </div>
                </div>
                <CardContent className="p-10 space-y-10">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">Lance Atual</p>
                      <p className="text-4xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                    </div>
                    <div className="flex items-center justify-between px-4">
                      <div className="text-left">
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Mínimo</p>
                        <p className="font-bold text-slate-600">+{formatCurrency(lot.bid_increment || 1000)}</p>
                      </div>
                      <div className="h-8 w-px bg-slate-100" />
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Visitas</p>
                        <p className="font-bold text-slate-600">1.2k</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-2">Seu Próximo Lance</Label>
                      <div className="relative">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-slate-300 text-2xl">R$</span>
                        <input 
                          type="number" 
                          value={bidAmount} 
                          onChange={(e) => setBidAmount(Number(e.target.value))} 
                          className="w-full text-3xl font-black h-24 pl-20 text-center rounded-[2rem] border-4 border-slate-50 focus:border-orange-500 focus:bg-white bg-slate-50 outline-none transition-all" 
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleBid} 
                      disabled={isSubmitting} 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white h-24 rounded-[2rem] text-2xl font-black shadow-2xl shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : (
                        <>
                          <Gavel size={28} />
                          CONFIRMAR LANCE
                        </>
                      )}
                    </Button>
                    <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <ShieldCheck size={18} className="text-green-500" /> 
                      Pagamento 100% Seguro
                    </div>
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