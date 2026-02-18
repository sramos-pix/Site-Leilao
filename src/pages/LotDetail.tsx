"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateWinningCertificate } from '@/lib/pdf-generator';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronLeft, Heart, Share2, Clock, Gavel,
  ShieldCheck, MapPin, Calendar, Gauge,
  Fuel, Settings2, Loader2, History, User,
  Trophy, Info, CheckCircle2, Lock as LockIcon,
  TrendingUp, CreditCard, AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, cn } from '@/lib/utils';
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
  const [user, setUser] = useState<any>(null);
  const [realBids, setRealBids] = useState<any[]>([]);

  const maskEmail = (email: string) => {
    if (!email || email === "usuario@leilao.com") return "Licitante Oculto";
    try {
      const [name, domain] = email.split('@');
      return `${name.substring(0, 2)}***@${domain.substring(0, 2)}***`;
    } catch (e) {
      return "Licitante Oculto";
    }
  };

  const isFinished = lot?.status === 'finished';

  // Lógica de lances unificada
  const displayBids = useMemo(() => {
    if (!lot) return [];
    
    // 1. Lances Reais (Preservando user_id original)
    const bids = [...realBids];
    
    // 2. Preenchimento Fictício para manter a lista com 10 itens
    const fakeEmails = ["m.silva@gmail.com", "ana.p@uol.com", "carlos.v@bol.com", "fer.l@gmail.com", "rob.a@outlook.com"];
    const startVal = lot.start_bid || 1000;
    const currentVal = lot.current_bid || startVal;
    const increment = lot.bid_increment || 500;
    
    let tempAmount = bids.length > 0 ? Math.min(...bids.map(b => b.amount)) : currentVal;

    while (bids.length < 10) {
      tempAmount -= increment;
      if (tempAmount < (startVal * 0.1)) break;
      bids.push({
        id: `fake-${bids.length}`,
        amount: tempAmount,
        user_email: fakeEmails[bids.length % fakeEmails.length],
        user_id: 'fake-id', // ID que nunca será igual ao do usuário logado
        is_fake: true
      });
    }
    
    return bids.sort((a, b) => b.amount - a.amount);
  }, [realBids, lot]);

  const fetchLotData = async () => {
    try {
      // Busca usuário logado
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // Busca dados do lote
      const { data: lotData } = await supabase
        .from('lots')
        .select('*, auctions(title)')
        .eq('id', id)
        .single();

      if (lotData) {
        setLot(lotData);
        const currentVal = lotData.current_bid || lotData.start_bid;
        setBidAmount(currentVal + (lotData.bid_increment || 500));
        
        // Fotos
        const { data: ph } = await supabase.from('lot_photos').select('*').eq('lot_id', id);
        setPhotos(ph || []);
        if (!activePhoto) setActivePhoto(lotData.cover_image_url);

        // Lances Reais com e-mail do perfil
        const { data: b } = await supabase
          .from('bids')
          .select(`id, amount, user_id, created_at, profiles(email)`)
          .eq('lot_id', id)
          .order('amount', { ascending: false });
        
        setRealBids((b || []).map(item => ({
          ...item,
          user_email: (item.profiles as any)?.email || "usuario@leilao.com"
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLotData();
    const channel = supabase.channel(`lot-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids', filter: `lot_id=eq.${id}` }, fetchLotData)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lots', filter: `id=eq.${id}` }, fetchLotData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleBid = async () => {
    if (!user) {
      toast({ title: "Login necessário", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await placeBid(lot.id, bidAmount);
      toast({ title: "Lance realizado!" });
      fetchLotData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !lot) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Galeria e Info */}
          <div className="lg:col-span-8 space-y-6">
            <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 relative border">
              <img src={activePhoto || lot.cover_image_url} className="w-full h-full object-cover" alt={lot.title} />
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
            
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[lot.cover_image_url, ...photos.map(p => p.public_url)].filter(Boolean).map((url, i) => (
                <button key={i} onClick={() => setActivePhoto(url)} className={cn("shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2", activePhoto === url ? 'border-orange-500' : 'border-transparent')}>
                  <img src={url} className="w-full h-full object-cover" alt="thumb" />
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-900">{lot.title}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border"><Gauge size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">KM</p><p className="text-sm font-bold">{lot.mileage_km?.toLocaleString()} km</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border"><Calendar size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">Ano</p><p className="text-sm font-bold">{lot.year}</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border"><Settings2 size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">Câmbio</p><p className="text-sm font-bold">{lot.transmission || 'Automático'}</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border"><Fuel size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">Motor</p><p className="text-sm font-bold">{lot.fuel_type || 'Flex'}</p></div>
              </div>
            </div>
          </div>

          {/* Painel de Lances */}
          <div className="lg:col-span-4 space-y-6">
            <Card className={cn("border-none shadow-xl rounded-3xl overflow-hidden text-white", isFinished ? "bg-slate-800" : "bg-slate-900")}>
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <Badge className={cn("text-white border-none px-3 py-1 rounded-full text-[10px] font-bold", isFinished ? "bg-white/20" : "bg-orange-500")}>{isFinished ? "ENCERRADO" : "AO VIVO"}</Badge>
                  {!isFinished && <div className="text-orange-500 font-bold text-sm"><CountdownTimer endsAt={lot.ends_at} lotId={lot.id} /></div>}
                </div>

                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{isFinished ? "Vendido por" : "Lance Atual"}</p>
                  <p className="text-4xl font-black text-white">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                </div>

                {!isFinished ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">R$</span>
                      <Input type="number" value={bidAmount} onChange={(e) => setBidAmount(Number(e.target.value))} className="w-full bg-white/5 border-white/10 text-white text-xl font-bold h-14 pl-12 rounded-2xl" />
                    </div>
                    <Button onClick={handleBid} disabled={isSubmitting} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-lg">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "DAR LANCE AGORA"}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white/10 p-4 rounded-2xl text-center text-xs font-bold">Leilão encerrado para este lote.</div>
                )}
              </CardContent>
            </Card>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><History size={16} className="text-orange-500" /> Últimos Lances</h3>
              <div className="space-y-3">
                {displayBids.map((bid, idx) => {
                  // Comparação robusta do ID do usuário
                  const isMe = user && bid.user_id === user.id;
                  
                  return (
                    <div key={bid.id} className={cn(
                      "flex items-center justify-between text-sm p-2 rounded-xl transition-colors",
                      isMe ? "bg-orange-50 border border-orange-100" : ""
                    )}>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full", 
                          idx === 0 && !isFinished ? "bg-orange-500 animate-pulse" : isMe ? "bg-orange-600" : "bg-slate-300"
                        )} />
                        <span className={cn(
                          "font-bold text-[11px]", 
                          isMe ? "text-orange-600" : "text-slate-700"
                        )}>
                          {isMe ? "Seu Lance" : maskEmail(bid.user_email)}
                        </span>
                      </div>
                      <span className={cn(
                        "font-black",
                        isMe ? "text-orange-600" : "text-slate-900"
                      )}>
                        {formatCurrency(bid.amount)}
                      </span>
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