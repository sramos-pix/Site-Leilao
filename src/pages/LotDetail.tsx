"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Clock, Gavel, Gauge, Calendar, 
  Settings2, Fuel, Loader2, History, Info, ShieldCheck
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, cn, maskEmail } from '@/lib/utils';
import { placeBid } from '@/lib/actions';
import { useToast } from '@/components/ui/use-toast';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LotDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [lot, setLot] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [activePhoto, setActivePhoto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [displayBids, setDisplayBids] = useState<any[]>([]);

  const isFinished = lot?.status === 'finished';

  const fakeEmails = [
    "marcos.silva@gmail.com", "ana.oliveira@hotmail.com", "carlos_edu@outlook.com",
    "fernanda.vendas@yahoo.com.br", "roberto.lances@gmail.com", "juliana.m@uol.com.br",
    "ricardo.auto@gmail.com", "patricia.leiloes@gmail.com", "thiago.f@hotmail.com",
    "beatriz.m@gmail.com"
  ];

  const fetchLotData = useCallback(async () => {
    try {
      // 1. Obter sessão atual de forma síncrona para garantir o ID
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      setCurrentUser(user);

      // 2. Obter dados do lote
      const { data: lotData } = await supabase
        .from('lots')
        .select('*, auctions(title)')
        .eq('id', id)
        .single();

      if (lotData) {
        setLot(lotData);
        
        // 3. Obter lances REAIS
        const { data: realBids } = await supabase
          .from('bids')
          .select('id, amount, user_id, created_at, profiles(email)')
          .eq('lot_id', id)
          .order('amount', { ascending: false });
        
        const currentPrice = lotData.current_bid || lotData.start_bid;
        const increment = lotData.bid_increment || 500;

        const formattedReals = (realBids || []).map(b => ({
          id: b.id,
          amount: b.amount,
          created_at: b.created_at,
          email: b.profiles?.email || 'usuario@autobid.com',
          user_id: b.user_id,
          is_fake: false
        }));

        // 4. Gerar fakes apenas se necessário para completar 10 itens
        const finalBids = [...formattedReals];
        if (finalBids.length < 10) {
          const needed = 10 - finalBids.length;
          const basePrice = finalBids.length > 0 ? finalBids[finalBids.length - 1].amount : currentPrice;
          const seed = id ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;

          for (let i = 0; i < needed; i++) {
            const fAmount = basePrice - ((i + 1) * increment);
            if (fAmount <= 0) continue;
            
            finalBids.push({
              id: `fake-${i}-${id}`,
              amount: fAmount,
              created_at: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
              email: fakeEmails[(seed + i) % fakeEmails.length],
              user_id: 'system-fake',
              is_fake: true
            });
          }
        }

        setDisplayBids(finalBids.sort((a, b) => b.amount - a.amount));
        setBidAmount(currentPrice + increment);
        
        const { data: ph } = await supabase.from('lot_photos').select('*').eq('lot_id', id);
        setPhotos(ph || []);
        if (!activePhoto) setActivePhoto(lotData.cover_image_url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [id, activePhoto]);

  useEffect(() => {
    fetchLotData();
    const channel = supabase.channel(`lot-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids', filter: `lot_id=eq.${id}` }, fetchLotData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, fetchLotData]);

  const handleBid = async () => {
    if (!currentUser) {
      toast({ title: "Login necessário", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await placeBid(lot.id, bidAmount);
      toast({ title: "Lance realizado!" });
      await fetchLotData(); // Atualiza tudo imediatamente
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !lot) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  const allImages = [lot.cover_image_url, ...photos.map(p => p.public_url)].filter(Boolean);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 relative border shadow-inner">
              <img src={activePhoto} className="w-full h-full object-cover" alt={lot.title} />
              {!isFinished && (
                <div className="absolute top-6 left-6 flex gap-3">
                  <Badge className="bg-slate-900/90 text-white border-none px-4 py-1.5 rounded-full font-bold text-xs">LOTE #{lot.lot_number}</Badge>
                  <Badge className="bg-red-500 text-white border-none px-4 py-1.5 rounded-full font-black flex items-center gap-2">
                    <Clock size={14} className="animate-pulse" /> 
                    <CountdownTimer endsAt={lot.ends_at} lotId={lot.id} />
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {allImages.map((url, i) => (
                <button key={i} onClick={() => setActivePhoto(url)} className={cn("shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all", activePhoto === url ? 'border-orange-500 scale-95 shadow-md' : 'border-transparent opacity-70')}>
                  <img src={url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-slate-900">{lot.title}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border"><Gauge size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">KM</p><p className="text-sm font-bold">{lot.mileage_km?.toLocaleString()} km</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border"><Calendar size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">Ano</p><p className="text-sm font-bold">{lot.year}</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border"><Settings2 size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">Câmbio</p><p className="text-sm font-bold">{lot.transmission || 'Automático'}</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border"><Fuel size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">Motor</p><p className="text-sm font-bold">{lot.fuel_type || 'Flex'}</p></div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Info size={20} className="text-orange-500" /> Detalhes</h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">{lot.description}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className={cn("border-none shadow-xl rounded-3xl overflow-hidden text-white", isFinished ? "bg-slate-800" : "bg-slate-900")}>
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <Badge className={cn("text-white border-none px-3 py-1 rounded-full text-[10px] font-bold", isFinished ? "bg-white/20" : "bg-orange-500")}>{isFinished ? "ENCERRADO" : "AO VIVO"}</Badge>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Lance Atual</p>
                  <p className="text-4xl font-black text-white">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                </div>
                {!isFinished && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-white/40 uppercase ml-1">Seu Lance</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">R$</span>
                        <Input type="number" value={bidAmount} onChange={(e) => setBidAmount(Number(e.target.value))} className="w-full bg-white/5 border-white/10 text-white text-xl font-bold h-14 pl-12 rounded-2xl" />
                      </div>
                    </div>
                    <Button onClick={handleBid} disabled={isSubmitting} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "DAR LANCE AGORA"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><History size={16} className="text-orange-500" /> Últimos Lances</h3>
              <div className="space-y-3">
                {displayBids.map((bid, idx) => {
                  // COMPARAÇÃO DIRETA: Se o user_id do lance for igual ao ID do usuário logado
                  const isMyBid = currentUser && bid.user_id === currentUser.id;
                  
                  return (
                    <div key={bid.id} className={cn(
                      "flex items-center justify-between text-sm p-3 rounded-2xl transition-all",
                      isMyBid ? "bg-orange-100 border border-orange-200 shadow-sm" : "bg-white/50"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", idx === 0 && !isFinished ? "bg-orange-500 animate-pulse" : "bg-slate-300")} />
                        <span className={cn("font-bold text-[11px]", isMyBid ? "text-orange-700" : "text-slate-700")}>
                          {isMyBid ? "SEU LANCE (VOCÊ)" : maskEmail(bid.email)}
                        </span>
                      </div>
                      <span className={cn("font-black", isMyBid ? "text-orange-600" : "text-slate-900")}>{formatCurrency(bid.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LotDetail;