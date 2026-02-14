"use client";

import React, { useEffect, useState, useMemo } from 'react';
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
import { formatCurrency, formatDate, cn } from '@/lib/utils';
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
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Lote não encontrado</h2>
        <Link to="/auctions">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">Voltar para Leilões</Button>
        </Link>
      </div>
    );
  }

  const isFinished = lot.status === 'finished';

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/auctions" className="inline-flex items-center text-sm text-slate-500 hover:text-orange-600 mb-6 font-bold">
          <ChevronLeft size={16} className="mr-1" /> VOLTAR
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl bg-slate-200 border-8 border-white relative">
              <img src={activePhoto || lot.cover_image_url} className="w-full h-full object-cover" alt={lot.title} />
              {isFinished && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-20">
                  <div className="bg-white p-10 rounded-[2.5rem] text-center">
                    <Trophy className="mx-auto text-orange-500 mb-4" size={56} />
                    <h2 className="text-4xl font-black text-slate-900">Lote Encerrado</h2>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h1 className="text-4xl font-black text-slate-900 mb-6">{lot.title}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-slate-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase">KM</p>
                  <p className="text-xl font-black">{lot.mileage_km?.toLocaleString()} km</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Ano</p>
                  <p className="text-xl font-black">{lot.year}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Câmbio</p>
                  <p className="text-xl font-black">{lot.transmission || 'Automático'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Motor</p>
                  <p className="text-xl font-black">{lot.fuel_type || 'Flex'}</p>
                </div>
              </div>
            </div>

            {/* HISTÓRICO DE LANCES */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <History className="text-orange-500" size={28} /> Histórico de Lances
              </h3>
              <div className="space-y-4">
                {realBids.length > 0 ? realBids.map((bid, idx) => (
                  <div key={bid.id} className={cn(
                    "flex items-center justify-between p-6 rounded-[2rem] border-2",
                    idx === 0 ? "bg-orange-50 border-orange-200" : "bg-white border-slate-50"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", idx === 0 ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400")}>
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{bid.user_id === user?.id ? "Seu Lance" : "Licitante"}</p>
                        <p className="text-xs text-slate-400">{formatDate(bid.created_at)}</p>
                      </div>
                    </div>
                    <p className={cn("font-black text-xl", idx === 0 ? "text-orange-600" : "text-slate-900")}>
                      {formatCurrency(bid.amount)}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-10 text-slate-400 font-bold">Nenhum lance ainda.</div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden sticky top-24 bg-white">
              <div className="bg-slate-900 p-10 text-white text-center">
                <div className="flex items-center justify-center gap-2 text-orange-500 mb-2">
                  <Clock size={20} />
                  <span className="text-xs font-black uppercase">Tempo Restante</span>
                </div>
                <div className="text-3xl font-black">
                  <CountdownTimer endsAt={lot.ends_at} randomScarcity={true} lotId={lot.id} />
                </div>
              </div>
              <CardContent className="p-10 space-y-8">
                <div className="text-center bg-slate-50 p-6 rounded-[2rem]">
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Lance Atual</p>
                  <p className="text-3xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                </div>
                {!isFinished && (
                  <div className="space-y-4">
                    <Input 
                      type="number" 
                      value={bidAmount} 
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="h-16 text-center text-2xl font-black rounded-2xl border-2 border-slate-100"
                    />
                    <Button 
                      onClick={handleBid} 
                      disabled={isSubmitting}
                      className="w-full h-20 bg-orange-500 hover:bg-orange-600 text-white rounded-[2rem] text-xl font-black shadow-xl shadow-orange-100"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "DAR LANCE"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotDetail;