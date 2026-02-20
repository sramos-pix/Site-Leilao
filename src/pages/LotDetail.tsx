"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Clock, Gavel, Gauge, Calendar, 
  Settings2, Fuel, Loader2, History, Info, 
  CheckCircle2, Lock as LockIcon, AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [realBids, setRealBids] = useState<any[]>([]);

  const isFinished = lot?.status === 'finished';

  const fetchLotData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      const { data: lotData } = await supabase
        .from('lots')
        .select('*, auctions(title)')
        .eq('id', id)
        .single();

      if (lotData) {
        setLot(lotData);
        
        const { data: b } = await supabase
          .from('bids')
          .select('id, amount, user_id, created_at')
          .eq('lot_id', id)
          .order('amount', { ascending: false });
        
        setRealBids(b || []);

        const basePrice = b && b.length > 0 ? (lotData.current_bid || lotData.start_bid) : lotData.start_bid;
        setBidAmount(basePrice + (lotData.bid_increment || 500));
        
        const { data: ph } = await supabase.from('lot_photos').select('*').eq('lot_id', id);
        setPhotos(ph || []);
        
        // Define a foto ativa inicial
        if (!activePhoto) {
          setActivePhoto(lotData.cover_image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200');
        }
      }
    } catch (e) {
      console.error("Erro:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLotData();
    const channel = supabase.channel(`lot-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids', filter: `lot_id=eq.${id}` }, fetchLotData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleBid = async () => {
    if (!currentUser) {
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

  // Lista de todas as imagens disponíveis (capa + galeria)
  const allImages = [lot.cover_image_url, ...photos.map(p => p.public_url)].filter(Boolean);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Visualizador de Imagem Principal */}
            <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 relative border shadow-inner">
              <img 
                src={activePhoto} 
                className="w-full h-full object-cover transition-opacity duration-300" 
                alt={lot.title}
                onError={(e) => {
                  // Se a imagem falhar, tenta a capa ou um placeholder
                  if (activePhoto !== lot.cover_image_url) {
                    setActivePhoto(lot.cover_image_url);
                  } else {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200';
                  }
                }}
              />
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
            
            {/* Miniaturas da Galeria */}
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {allImages.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => setActivePhoto(url)} 
                  className={cn(
                    "shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all", 
                    activePhoto === url ? 'border-orange-500 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  )}
                >
                  <img 
                    src={url} 
                    className="w-full h-full object-cover" 
                    alt={`Miniatura ${i}`}
                    onError={(e) => {
                      // Esconde miniaturas que não carregam
                      e.currentTarget.parentElement?.style.setProperty('display', 'none');
                    }}
                  />
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
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Info size={20} className="text-orange-500" /> Detalhes do Veículo
                </h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {lot.description || "Nenhuma descrição detalhada fornecida para este veículo."}
                </div>
              </div>
            </div>
          </div>

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
                  <div className="bg-white/10 p-4 rounded-2xl text-center text-xs font-bold">Leilão encerrado.</div>
                )}
              </CardContent>
            </Card>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <History size={16} className="text-orange-500" /> Últimos Lances
              </h3>
              <div className="space-y-3">
                {realBids.length > 0 ? realBids.slice(0, 5).map((bid, idx) => (
                  <div key={bid.id} className="flex items-center justify-between text-sm p-3 rounded-2xl bg-white/50">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", idx === 0 ? "bg-orange-500 animate-pulse" : "bg-slate-300")} />
                      <span className="font-bold text-[11px] text-slate-700">Licitante Oculto</span>
                    </div>
                    <span className="font-black text-slate-900">{formatCurrency(bid.amount)}</span>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 text-center py-4 italic">Nenhum lance registrado.</p>
                )}
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