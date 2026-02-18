"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateWinningCertificate } from '@/lib/pdf-generator';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronLeft, Heart, Share2, Clock, Gavel,
  ShieldCheck, MapPin, Calendar, Gauge,
  Fuel, Settings2, Loader2, History, User,
  Trophy, Info, CheckCircle2, Lock as LockIcon
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
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const maskEmail = (email: string) => {
    if (!email) return "Licitante Oculto";
    try {
      const [name, domain] = email.split('@');
      return name.substring(0, 2) + "***@" + domain.substring(0, 2) + "***";
    } catch (e) {
      return "Licitante Oculto";
    }
  };

  // Lógica de encerramento ultra-permissiva
  const isFinished = useMemo(() => {
    if (!lot) return false;
    
    // Se não tem data de término, o leilão está SEMPRE ATIVO, 
    // a menos que o status seja explicitamente 'finished'
    if (!lot.ends_at) {
      return lot.status === 'finished';
    }
    
    // Se tem data, verifica se já passou
    const endTime = new Date(lot.ends_at).getTime();
    const currentTime = now.getTime();
    
    if (lot.status === 'finished' || endTime <= currentTime) {
      return true;
    }
    
    return false;
  }, [lot, now]);

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

      // Garante que o valor do lance inicial seja válido
      const currentVal = lotData.current_bid || lotData.start_bid || 0;
      const increment = lotData.bid_increment || 500;
      setBidAmount(currentVal + increment);

      const { data: bidsData } = await supabase
        .from('bids')
        .select('*, profiles(email, full_name)')
        .eq('lot_id', id)
        .order('amount', { ascending: false });
      
      setRealBids((bidsData || []).map(b => ({
        ...b,
        user_email: b.profiles?.email || "usuario@leilao.com"
      })));

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lots', filter: `id=eq.${id}` }, () => fetchLotData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleBid = async () => {
    if (!user) {
      toast({ title: "Acesso restrito", description: "Faça login para dar lances.", variant: "destructive" });
      return;
    }

    const minBid = (lot.current_bid || lot.start_bid) + (lot.bid_increment || 500);
    if (bidAmount < minBid) {
      toast({ 
        title: "Lance inválido", 
        description: `O lance mínimo é ${formatCurrency(minBid)}`, 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await placeBid(lot.id, bidAmount);
      toast({ title: "Lance efetuado com sucesso!" });
      fetchLotData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao processar lance", description: error.message });
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

  const isWinner = user && lot.winner_id === user.id;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1">
        {isFinished && isWinner && (
          <div className="mb-8 bg-emerald-500 text-white p-6 rounded-[2rem] shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Trophy size={32} />
              <div>
                <h2 className="text-2xl font-black">Você Venceu!</h2>
                <p className="text-emerald-50 text-sm">Parabéns pelo arremate.</p>
              </div>
            </div>
            <Link to={`/app/checkout/${lot.id}`}>
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50 font-black px-8 py-6 rounded-2xl">
                PAGAR AGORA
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 relative border border-slate-100">
              <img 
                src={activePhoto || lot.cover_image_url} 
                className={cn("w-full h-full object-cover", isFinished && !isWinner && "brightness-50 grayscale-[0.5]")} 
                alt={lot.title} 
              />
              {isFinished && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Badge className="bg-white text-slate-900 px-6 py-2 text-lg font-bold rounded-full">
                    {isWinner ? "ARREMATADO POR VOCÊ" : "ENCERRADO"}
                  </Badge>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{lot.title}</h1>
            <p className="text-slate-600">{lot.description || "Veículo disponível para lances."}</p>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className={cn("border-none shadow-xl rounded-3xl overflow-hidden text-white", isFinished && isWinner ? "bg-emerald-600" : "bg-slate-900")}>
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <Badge className={cn("text-white border-none px-3 py-1 rounded-full text-[10px] font-bold", isFinished ? "bg-white/20" : "bg-orange-500")}>
                    {isFinished ? "ENCERRADO" : "AO VIVO"}
                  </Badge>
                  {!isFinished && lot.ends_at && (
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                      <Clock size={16} />
                      <CountdownTimer endsAt={lot.ends_at} lotId={lot.id} />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/60 uppercase">Lance Atual</p>
                  <p className="text-4xl font-black">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                </div>

                {!isFinished ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">R$</span>
                      <Input 
                        type="number" 
                        value={bidAmount} 
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="w-full bg-white/5 border-white/10 text-white text-xl font-bold h-14 pl-12 rounded-2xl" 
                      />
                    </div>
                    <Button 
                      onClick={handleBid} 
                      disabled={isSubmitting}
                      className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-lg font-bold shadow-lg"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "DAR LANCE AGORA"}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/20 flex items-center gap-3">
                    <LockIcon size={24} />
                    <p className="text-xs font-bold">Leilão encerrado para novos lances.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <History size={16} className="text-orange-500" /> Histórico de Lances
              </h3>
              <div className="space-y-3">
                {realBids.slice(0, 10).map((bid, idx) => (
                  <div key={bid.id} className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700">{user && bid.user_id === user.id ? "Seu Lance" : maskEmail(bid.user_email)}</span>
                    <span className="font-black text-slate-900">{formatCurrency(bid.amount)}</span>
                  </div>
                ))}
                {realBids.length === 0 && <p className="text-xs text-slate-400 italic text-center">Nenhum lance real ainda.</p>}
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