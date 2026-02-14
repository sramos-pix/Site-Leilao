"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, Clock, Gavel, 
  ShieldCheck, MapPin, Calendar, Gauge, 
  Fuel, Settings2, Loader2, History, User, 
  TrendingUp, Lock, Trophy, Info, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
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
      setBidAmount(currentVal + (lotData.bid_increment || 1000));

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
      .channel(`lot-realtime-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids', filter: `lot_id=eq.${id}` }, () => fetchLotData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleBid = async () => {
    if (!user) {
      toast({ title: "Acesso restrito", description: "Faça login para dar lances.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await placeBid(lot.id, bidAmount);
      toast({ title: "Lance efetuado!" });
      fetchLotData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!lot) return null;

  const isFinished = lot.status === 'finished';

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <Link to="/auctions" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors">
            <ChevronLeft size={18} className="mr-1" /> VOLTAR PARA LEILÕES
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full border-slate-200"><Share2 size={18} /></Button>
            <Button variant="outline" size="icon" className="rounded-full border-slate-200"><Heart size={18} /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna da Esquerda: Galeria e Info */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 relative group border border-slate-100">
                <img src={activePhoto || lot.cover_image_url} className="w-full h-full object-cover" alt={lot.title} />
                {isFinished && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <Badge className="bg-white text-slate-900 px-6 py-2 text-lg font-bold rounded-full">ENCERRADO</Badge>
                  </div>
                )}
              </div>
              
              {/* Miniaturas */}
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {[lot.cover_image_url, ...photos.map(p => p.public_url)].filter(Boolean).map((url, i) => (
                  <button 
                    key={i}
                    onClick={() => setActivePhoto(url)}
                    className={cn(
                      "shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all",
                      activePhoto === url ? 'border-orange-500' : 'border-transparent opacity-70 hover:opacity-100'
                    )}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`Foto ${i}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{lot.title}</h1>
                <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                  <span className="flex items-center gap-1"><MapPin size={14} /> Pátio: São Paulo, SP</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> Lote: #{lot.lot_number}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Gauge, label: 'KM', value: `${lot.mileage_km?.toLocaleString()} km` },
                  { icon: Calendar, label: 'Ano', value: lot.year },
                  { icon: Settings2, label: 'Câmbio', value: lot.transmission || 'Automático' },
                  { icon: Fuel, label: 'Motor', value: lot.fuel_type || 'Flex' }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <item.icon size={18} className="text-orange-500 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Info size={20} className="text-orange-500" /> Descrição do Lote
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {lot.description || "Veículo em excelente estado de conservação, periciado e com documentação garantida pela AutoBid. Ideal para quem busca qualidade e procedência em leilões online."}
                </p>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Painel de Lances */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-slate-900 text-white">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <Badge className="bg-orange-500 text-white border-none px-3 py-1 rounded-full text-[10px] font-bold">AO VIVO</Badge>
                  <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                    <Clock size={16} />
                    <CountdownTimer endsAt={lot.ends_at} randomScarcity={true} lotId={lot.id} />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lance Atual</p>
                  <p className="text-4xl font-black text-white">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Inicial</p>
                    <p className="text-sm font-bold">{formatCurrency(lot.start_bid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Incremento</p>
                    <p className="text-sm font-bold text-orange-500">+{formatCurrency(lot.bid_increment || 500)}</p>
                  </div>
                </div>

                {!isFinished && (
                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">R$</span>
                      <Input 
                        type="number" 
                        value={bidAmount} 
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="w-full bg-white/5 border-white/10 text-white text-xl font-bold h-14 pl-12 rounded-2xl focus:ring-orange-500" 
                      />
                    </div>
                    <Button 
                      onClick={handleBid} 
                      disabled={isSubmitting}
                      className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "DAR LANCE AGORA"}
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                  <ShieldCheck size={14} className="text-emerald-500" /> Leilão Seguro & Auditado
                </div>
              </CardContent>
            </Card>

            {/* Histórico Simplificado */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <History size={16} className="text-orange-500" /> Últimos Lances
              </h3>
              <div className="space-y-3">
                {realBids.slice(0, 5).map((bid, idx) => (
                  <div key={bid.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", idx === 0 ? "bg-orange-500 animate-pulse" : "bg-slate-300")} />
                      <span className="font-medium text-slate-600">{bid.user_id === user?.id ? "Seu Lance" : "Licitante"}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(bid.amount)}</span>
                  </div>
                ))}
                {realBids.length === 0 && <p className="text-xs text-slate-400 italic text-center">Nenhum lance ainda.</p>}
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