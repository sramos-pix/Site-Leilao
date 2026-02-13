"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, Clock, Gavel, 
  ShieldCheck, MapPin, Calendar, Gauge, 
  Fuel, Settings2, Loader2, AlertTriangle,
  History, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, maskEmail, formatDate } from '@/lib/utils';
import { placeBid } from '@/lib/actions';
import { useToast } from '@/components/ui/use-toast';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';

const LotDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [lot, setLot] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [activePhoto, setActivePhoto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState(false);
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

      const minIncrement = lotData.current_bid < 100000 ? 1000 : 2000;
      setBidAmount((lotData.current_bid || lotData.start_bid) + minIncrement);

      // Buscar lances REAIS
      const { data: bidsData } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          created_at,
          profiles ( email )
        `)
        .eq('lot_id', id)
        .order('amount', { ascending: false });
      
      setRealBids(bidsData || []);

      if (currentUser) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('lot_id', id)
          .single();
        setIsFavorite(!!favData);
      }

    } catch (error: any) {
      console.error("Erro ao carregar lote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lances fictícios dinâmicos baseados no lance atual real
  const allBids = useMemo(() => {
    const currentMax = lot?.current_bid || lot?.start_bid || 0;
    
    // Se não houver lances reais, criamos fictícios baseados no lance inicial
    // Se houver lances reais, os fictícios ficam abaixo do menor lance real
    const baseForMock = realBids.length > 0 
      ? realBids[realBids.length - 1].amount 
      : currentMax;

    const mockBids = [
      { 
        id: 'm1', 
        amount: baseForMock - 2000, 
        created_at: new Date(Date.now() - 3600000).toISOString(), 
        profiles: { email: 'carlos***@gmail.com' } 
      },
      { 
        id: 'm2', 
        amount: baseForMock - 5000, 
        created_at: new Date(Date.now() - 7200000).toISOString(), 
        profiles: { email: 'marcos***@uol.com.br' } 
      },
      { 
        id: 'm3', 
        amount: baseForMock - 8500, 
        created_at: new Date(Date.now() - 10800000).toISOString(), 
        profiles: { email: 'ana.pa***@outlook.com' } 
      },
    ].filter(m => m.amount > (lot?.start_bid || 0) * 0.5); // Garante que não fique negativo ou muito baixo

    const combined = [...realBids, ...mockBids];
    return combined.sort((a, b) => b.amount - a.amount);
  }, [realBids, lot]);

  useEffect(() => {
    fetchLotData();
    const channel = supabase
      .channel(`lot-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids', filter: `lot_id=eq.${id}` }, () => fetchLotData())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lots', filter: `id=eq.${id}` }, () => fetchLotData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleBid = async () => {
    if (!lot || !user) {
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>;
  if (!lot) return <div className="text-center py-20">Lote não encontrado.</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <Link to="/auctions" className="inline-flex items-center text-sm text-slate-500 hover:text-orange-600 mb-6 font-bold">
          <ChevronLeft size={16} className="mr-1" /> VOLTAR PARA LEILÕES
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-200 border-4 border-white group">
                <img src={activePhoto} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
                  <Badge className="mb-3 bg-orange-100 text-orange-600 border-none px-4 py-1 rounded-full font-bold">LOTE #{lot.lot_number}</Badge>
                  <h1 className="text-3xl font-black text-slate-900">{lot.title}</h1>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-100">
                <div className="space-y-1"><div className="flex items-center gap-2 text-slate-400 mb-1"><Gauge size={16} /><span className="text-[10px] font-black">KM</span></div><p className="font-bold">{lot.mileage_km?.toLocaleString()} km</p></div>
                <div className="space-y-1"><div className="flex items-center gap-2 text-slate-400 mb-1"><Calendar size={16} /><span className="text-[10px] font-black">ANO</span></div><p className="font-bold">{lot.year}</p></div>
                <div className="space-y-1"><div className="flex items-center gap-2 text-slate-400 mb-1"><Settings2 size={16} /><span className="text-[10px] font-black">CÂMBIO</span></div><p className="font-bold">Automático</p></div>
                <div className="space-y-1"><div className="flex items-center gap-2 text-slate-400 mb-1"><Fuel size={16} /><span className="text-[10px] font-black">MOTOR</span></div><p className="font-bold">Flex</p></div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Descrição do Lote</h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">{lot.description || "Sem descrição."}</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><History size={24} /></div>
                <h3 className="text-2xl font-black text-slate-900">Histórico de Lances</h3>
              </div>

              <div className="space-y-4">
                {allBids.map((bid, index) => (
                  <div key={bid.id} className={`flex items-center justify-between p-5 rounded-3xl ${index === 0 ? 'bg-orange-50 border-2 border-orange-100' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${index === 0 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}><User size={20} /></div>
                      <div>
                        <p className="font-bold text-slate-900">{maskEmail(bid.profiles?.email || 'usuário@***')}</p>
                        <p className="text-xs text-slate-400">{formatDate(bid.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${index === 0 ? 'text-orange-600' : 'text-slate-900'}`}>{formatCurrency(bid.amount)}</p>
                      {index === 0 && <Badge className="bg-orange-500 text-[10px]">LANCE ATUAL</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-24">
              <div className="bg-slate-900 p-8 text-white text-center">
                <div className="flex items-center justify-center gap-2 text-orange-500 mb-3"><Clock size={20} /><span className="text-xs font-black uppercase">Tempo Restante</span></div>
                <CountdownTimer endsAt={lot.ends_at} />
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="text-center bg-slate-50 py-6 rounded-3xl border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-black mb-2">Lance Atual</p>
                  <p className="text-4xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-slate-500 font-bold text-xs uppercase ml-1">Seu Lance</Label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">R$</span>
                      <Input type="number" value={bidAmount} onChange={(e) => setBidAmount(Number(e.target.value))} className="text-2xl font-black h-20 pl-16 text-center rounded-3xl border-2 border-slate-100 focus:border-orange-500" />
                    </div>
                  </div>
                  <Button onClick={handleBid} disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white h-20 rounded-3xl text-xl font-black shadow-lg shadow-orange-200">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'CONFIRMAR LANCE'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotDetail;