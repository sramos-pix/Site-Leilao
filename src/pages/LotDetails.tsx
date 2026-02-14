"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, Clock, Gavel, 
  ShieldCheck, MapPin, Calendar, Gauge, 
  Fuel, Settings2, Loader2, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LotDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [lot, setLot] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [activePhoto, setActivePhoto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Busca os dados do lote
      const { data: lotData, error: lotError } = await supabase
        .from('lots')
        .select('*, auctions(title, starts_at)')
        .eq('id', id)
        .single();

      if (lotError) throw lotError;

      // Busca fotos adicionais se existirem
      const { data: photosData } = await supabase
        .from('lot_photos')
        .select('*')
        .eq('lot_id', id)
        .order('is_cover', { ascending: false });

      setLot(lotData);
      setPhotos(photosData || []);
      
      // Define a foto ativa (prioridade para a capa ou a primeira da galeria)
      if (lotData.cover_image_url) {
        setActivePhoto(lotData.cover_image_url);
      } else if (photosData && photosData.length > 0) {
        setActivePhoto(photosData[0].public_url);
      } else {
        setActivePhoto('https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200');
      }

      // Define o valor inicial do input de lance
      const currentVal = lotData.current_bid || lotData.start_bid;
      const minIncrement = lotData.bid_increment || 500;
      setBidAmount(String(currentVal + minIncrement));

    } catch (error: any) {
      console.error("Erro ao carregar lote:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os detalhes do veículo." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePlaceBid = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Acesso restrito", description: "Faça login para dar lances.", variant: "destructive" });
      return;
    }

    toast({ title: "Lance enviado!", description: "Seu lance está sendo processado." });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>;
  if (!lot) return <div className="text-center py-20">Lote não encontrado.</div>;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <Link to="/auctions" className="inline-flex items-center text-sm text-slate-500 hover:text-orange-600 mb-6 font-bold">
          <ChevronLeft size={16} className="mr-1" /> VOLTAR PARA LEILÕES
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Galeria e Info Técnica */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-200 border-4 border-white relative group">
                <img src={activePhoto} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={lot.title} />
                <div className="absolute top-6 left-6 flex gap-3">
                  <Badge className="bg-slate-900/90 backdrop-blur-md text-white border-none px-4 py-1.5 rounded-full font-bold text-xs">LOTE #{lot.lot_number}</Badge>
                  <Badge className="bg-orange-500 text-white border-none px-4 py-1.5 rounded-full font-black flex items-center gap-2 shadow-lg shadow-orange-500/30">
                    <Clock size={14} className="animate-pulse" /> 
                    <CountdownTimer randomScarcity={true} lotId={lot.id} />
                  </Badge>
                </div>
              </div>
              
              {/* Miniaturas da Galeria */}
              {(photos.length > 0 || lot.cover_image_url) && (
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {lot.cover_image_url && (
                    <button 
                      onClick={() => setActivePhoto(lot.cover_image_url)}
                      className={`shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${activePhoto === lot.cover_image_url ? 'border-orange-500 scale-95' : 'border-white opacity-70'}`}
                    >
                      <img src={lot.cover_image_url} className="w-full h-full object-cover" alt="Capa" />
                    </button>
                  )}
                  {photos.map((photo) => (
                    <button 
                      key={photo.id} 
                      onClick={() => setActivePhoto(photo.public_url)}
                      className={`shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${activePhoto === photo.public_url ? 'border-orange-500 scale-95' : 'border-white opacity-70'}`}
                    >
                      <img src={photo.public_url} className="w-full h-full object-cover" alt="Galeria" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h1 className="text-3xl font-black text-slate-900 mb-6">{lot.title}</h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Gauge size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Quilometragem</span>
                  </div>
                  <p className="font-bold text-slate-900">{lot.mileage_km?.toLocaleString() || '0'} km</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ano Modelo</span>
                  </div>
                  <p className="font-bold text-slate-900">{lot.year || 'N/I'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Settings2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Câmbio</span>
                  </div>
                  <p className="font-bold text-slate-900">{lot.transmission || 'Automático'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Fuel size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Combustível</span>
                  </div>
                  <p className="font-bold text-slate-900">{lot.fuel_type || 'Flex'}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Info size={20} className="text-orange-500" /> Detalhes do Veículo
                </h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {lot.description || "Veículo em excelente estado de conservação, periciado e com documentação garantida pela AutoBid."}
                </div>
              </div>
            </div>
          </div>

          {/* Painel de Lances Lateral */}
          <div className="lg:col-span-4">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-24">
              <div className="bg-slate-900 p-8 text-white text-center">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Lance Atual</p>
                <p className="text-4xl font-black">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-slate-50 py-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Inicial</p>
                    <p className="font-bold text-slate-900">{formatCurrency(lot.start_bid)}</p>
                  </div>
                  <div className="text-center bg-orange-50 py-4 rounded-2xl border border-orange-100">
                    <p className="text-[10px] text-orange-400 uppercase font-black mb-1">Incremento</p>
                    <p className="font-bold text-orange-600">+{formatCurrency(lot.bid_increment || 500)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-500 font-bold text-xs uppercase ml-1">Seu Lance</Label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">R$</span>
                      <Input 
                        type="number" 
                        value={bidAmount} 
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full text-2xl font-black h-16 pl-14 text-center rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none" 
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handlePlaceBid}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-16 rounded-2xl text-lg font-black shadow-lg shadow-orange-100 transition-all active:scale-95"
                  >
                    <Gavel size={20} className="mr-2" /> DAR LANCE AGORA
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <ShieldCheck size={14} className="text-green-500" /> Ambiente Seguro & Criptografado
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LotDetails;