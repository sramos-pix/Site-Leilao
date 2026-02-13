"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, Clock, Gavel, 
  ShieldCheck, Info, MapPin, Calendar, Gauge, 
  Fuel, Settings2, Palette, History, AlertTriangle, Loader2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
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

  useEffect(() => {
    const fetchLotData = async () => {
      setIsLoading(true);
      try {
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

      } catch (error: any) {
        toast({ variant: "destructive", title: "Erro ao carregar lote", description: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLotData();
  }, [id, toast]);

  const handleBid = async () => {
    if (!lot) return;
    setIsSubmitting(true);
    try {
      await placeBid(lot.id, bidAmount);
      toast({ 
        title: "Lance efetuado!", 
        description: `Seu lance de ${formatCurrency(bidAmount)} foi registrado.` 
      });
      setLot({ ...lot, current_bid: bidAmount });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao dar lance", description: error.message });
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Lote não encontrado</h2>
        <Link to="/auctions"><Button>Voltar para Leilões</Button></Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <Link to="/auctions" className="inline-flex items-center text-sm text-slate-500 hover:text-orange-600 mb-6 transition-colors font-bold">
          <ChevronLeft size={16} className="mr-1" /> VOLTAR PARA LEILÕES
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              {/* Container da Imagem com Zoom no Hover */}
              <div className="aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-200 border-4 border-white group cursor-zoom-in">
                {activePhoto ? (
                  <img 
                    src={activePhoto} 
                    alt={lot.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-125" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <AlertTriangle size={48} />
                  </div>
                )}
              </div>
              
              {photos.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {photos.map((photo) => (
                    <button 
                      key={photo.id}
                      onClick={() => setActivePhoto(photo.public_url)}
                      className={`relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activePhoto === photo.public_url ? 'border-orange-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={photo.public_url} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
              
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <Badge className="mb-3 bg-orange-100 text-orange-600 hover:bg-orange-100 border-none px-4 py-1 rounded-full font-bold">
                    LOTE #{lot.lot_number}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">{lot.title}</h1>
                  <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                    <MapPin size={16} /> São Paulo, SP
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-slate-200 hover:text-orange-600 hover:border-orange-200"><Heart size={20} /></Button>
                  <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-slate-200 hover:text-orange-600 hover:border-orange-200"><Share2 size={20} /></Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Gauge size={16} />
                    <span className="text-[10px] uppercase font-black tracking-widest">KM</span>
                  </div>
                  <p className="font-bold text-slate-800">{lot.mileage_km?.toLocaleString() || '0'} km</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar size={16} />
                    <span className="text-[10px] uppercase font-black tracking-widest">ANO</span>
                  </div>
                  <p className="font-bold text-slate-800">{lot.year || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Settings2 size={16} />
                    <span className="text-[10px] uppercase font-black tracking-widest">CÂMBIO</span>
                  </div>
                  <p className="font-bold text-slate-800">Automático</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Fuel size={16} />
                    <span className="text-[10px] uppercase font-black tracking-widest">MOTOR</span>
                  </div>
                  <p className="font-bold text-slate-800">Flex</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Descrição do Lote</h3>
                <p className="text-slate-600 leading-relaxed">
                  Veículo em excelente estado de conservação, revisado e com garantia de procedência. 
                  Documentação em dia, pronto para transferência. Oportunidade única para colecionadores e entusiastas.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-24">
              <div className="bg-slate-900 p-8 text-white text-center">
                <div className="flex items-center justify-center gap-2 text-orange-500 mb-3">
                  <Clock size={20} className="animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest">Tempo Restante</span>
                </div>
                {/* Ativando o randomScarcity para gerar urgência */}
                <CountdownTimer randomScarcity={true} />
              </div>
              
              <CardContent className="p-8 space-y-8">
                <div className="text-center bg-slate-50 py-6 rounded-3xl border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-2">Lance Atual</p>
                  <p className="text-4xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="bid-amount" className="text-slate-500 font-bold text-xs uppercase tracking-wider ml-1">Seu Lance</Label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">R$</span>
                      <Input 
                        id="bid-amount"
                        type="number" 
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="text-2xl font-black h-20 pl-16 text-center rounded-3xl border-2 border-slate-100 focus:border-orange-500 focus:ring-0 transition-all"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tight">
                    Incremento mínimo sugerido: <span className="text-slate-600">R$ 1.000,00</span>
                  </p>
                  <Button 
                    onClick={handleBid}
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-20 rounded-3xl text-xl font-black shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : (
                      <>
                        <Gavel size={24} />
                        CONFIRMAR LANCE
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-blue-50 p-5 rounded-3xl flex gap-4 border border-blue-100">
                  <ShieldCheck className="text-blue-600 shrink-0" size={24} />
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-blue-900 uppercase tracking-wider">Compra Segura</p>
                    <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                      Este leilão possui <strong>Anti-Sniper</strong>. Lances nos últimos 2 minutos estendem o tempo automaticamente.
                    </p>
                  </div>
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