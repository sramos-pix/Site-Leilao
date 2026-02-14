"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, Clock, Gavel, 
  ShieldCheck, MapPin, Calendar, Gauge, 
  Fuel, Settings2, Loader2, History, User, 
  TrendingUp, Lock, Trophy, Info
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

  if (!lot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Lote não encontrado</h2>
        <Link to="/auctions">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">Voltar para Leilões</Button>
        </Link>
      </div>
    );
  }

  const isFinished = lot.status === 'finished';

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1">
        <Link to="/auctions" className="inline-flex items-center text-xs text-slate-500 hover:text-orange-600 mb-4 font-bold uppercase tracking-wider">
          <ChevronLeft size={14} className="mr-1" /> Voltar para Leilões
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Galeria e Info Técnica */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-sm bg-slate-200 border border-white relative group">
                <img src={activePhoto || lot.cover_image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={lot.title} />
                {isFinished && (
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded-2xl text-center shadow-xl">
                      <Trophy className="mx-auto text-orange-500 mb-2" size={40} />
                      <h2 className="text-2xl font-bold text-slate-900">Lote Encerrado</h2>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-none px-3 py-1 rounded-lg font-bold text-[10px]">LOTE #{lot.lot_number}</Badge>
                  <Badge className="bg-orange-500 text-white border-none px-3 py-1 rounded-full font-bold flex items-center gap-1.5 text-[10px] shadow-lg shadow-orange-500/20">
                    <Clock size={12} className="animate-pulse" /> 
                    <CountdownTimer endsAt={lot.ends_at} randomScarcity={true} lotId={lot.id} />
                  </Badge>
                </div>
              </div>
              
              {/* Miniaturas */}
              {(photos.length > 0 || lot.cover_image_url) && (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {lot.cover_image_url && (
                    <button 
                      onClick={() => setActivePhoto(lot.cover_image_url)}
                      className={cn(
                        "shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                        activePhoto === lot.cover_image_url ? 'border-orange-500' : 'border-white opacity-70'
                      )}
                    >
                      <img src={lot.cover_image_url} className="w-full h-full object-cover" alt="Capa" />
                    </button>
                  )}
                  {photos.map((photo) => (
                    <button 
                      key={photo.id} 
                      onClick={() => setActivePhoto(photo.public_url)}
                      className={cn(
                        "shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                        activePhoto === photo.public_url ? 'border-orange-500' : 'border-white opacity-70'
                      )}
                    >
                      <img src={photo.public_url} className="w-full h-full object-cover" alt="Galeria" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 tracking-tight">{lot.title}</h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-slate-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quilometragem</p>
                  <p className="text-base font-bold text-slate-800">{lot.mileage_km?.toLocaleString() || '0'} km</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ano Modelo</p>
                  <p className="text-base font-bold text-slate-800">{lot.year || 'N/I'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Câmbio</p>
                  <p className="text-base font-bold text-slate-800">{lot.transmission || 'Automático'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Combustível</p>
                  <p className="text-base font-bold text-slate-800">{lot.fuel_type || 'Flex'}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Info size={18} className="text-orange-500" /> Detalhes do Veículo
                </h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {lot.description || "Veículo em excelente estado de conservação, periciado e com documentação garantida pela AutoBid."}
                </div>
              </div>
            </div>

            {/* Histórico de Lances */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <History className="text-orange-500" size={20} /> Histórico de Lances
              </h3>
              <div className="space-y-3">
                {realBids.length > 0 ? realBids.map((bid, idx) => (
                  <div key={bid.id} className={cn(
                    "flex items-center justify-between p-4 rounded-xl border",
                    idx === 0 ? "bg-orange-50/50 border-orange-100" : "bg-white border-slate-50"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        idx === 0 ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{bid.user_id === user?.id ? "Seu Lance" : "Licitante"}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{formatDate(bid.created_at)}</p>
                      </div>
                    </div>
                    <p className={cn("font-bold text-base", idx === 0 ? "text-orange-600" : "text-slate-900")}>
                      {formatCurrency(bid.amount)}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-400 text-sm font-medium italic">Nenhum lance registrado ainda.</div>
                )}
              </div>
            </div>
          </div>

          {/* Painel de Lances Lateral */}
          <div className="lg:col-span-4">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden sticky top-24 bg-white border border-slate-100">
              <div className="bg-slate-900 p-6 text-white text-center">
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Lance Atual</p>
                <p className="text-3xl font-bold tracking-tight">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-slate-50 py-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Inicial</p>
                    <p className="text-sm font-bold text-slate-700">{formatCurrency(lot.start_bid)}</p>
                  </div>
                  <div className="text-center bg-orange-50/50 py-3 rounded-xl border border-orange-100">
                    <p className="text-[10px] text-orange-400 uppercase font-bold mb-0.5">Incremento</p>
                    <p className="text-sm font-bold text-orange-600">+{formatCurrency(lot.bid_increment || 500)}</p>
                  </div>
                </div>

                {!isFinished && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Seu Lance</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-300 text-lg">R$</span>
                        <Input 
                          type="number" 
                          value={bidAmount} 
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          className="w-full text-xl font-bold h-12 pl-11 text-center rounded-xl border-slate-200 focus:ring-orange-500" 
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleBid} 
                      disabled={isSubmitting}
                      className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-base font-bold shadow-md shadow-orange-100 transition-all active:scale-[0.98]"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <><Gavel size={18} className="mr-2" /> DAR LANCE</>}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      <ShieldCheck size={14} className="text-emerald-500" /> Ambiente Seguro & Auditado
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LotDetail;