"use client";

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, Clock, Gavel, 
  ShieldCheck, Info, MapPin, Calendar, Gauge, 
  Fuel, Settings2, Palette, History, AlertTriangle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { placeBid } from '@/lib/actions';
import { useToast } from '@/components/ui/use-toast';
import CountdownTimer from '@/components/CountdownTimer';

// Mock data para visualização imediata
const MOCK_LOT = {
  id: 'l1',
  auction_id: '1',
  lot_number: 1,
  title: 'BMW 320i M Sport 2022',
  current_bid: 215000,
  start_bid: 180000,
  ends_at: new Date(Date.now() + 3600000 * 2 + 42 * 60000 + 15000).toISOString(), // 2h 42m 15s a partir de agora
  images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200'],
  bids: []
};

const LotDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const lot = MOCK_LOT;

  const getIncrement = (val: number) => {
    if (val < 20000) return 200;
    if (val < 50000) return 500;
    if (val < 100000) return 1000;
    return 2000;
  };

  const minIncrement = getIncrement(lot.current_bid);
  const [bidAmount, setBidAmount] = React.useState(lot.current_bid + minIncrement);

  const handleBid = async () => {
    setIsSubmitting(true);
    try {
      await placeBid(lot.id, bidAmount);
      toast({ 
        title: "Lance efetuado!", 
        description: `Seu lance de ${formatCurrency(bidAmount)} foi registrado.` 
      });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro ao dar lance", 
        description: error.message || "Ocorreu um erro inesperado." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <Link to="/auctions" className="inline-flex items-center text-sm text-slate-500 hover:text-orange-600 mb-6 transition-colors">
          <ChevronLeft size={16} className="mr-1" /> Voltar para Leilões
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
             <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-lg mb-8 bg-slate-200">
                <img src={lot.images[0]} alt={lot.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Badge variant="outline" className="mb-2 border-orange-200 text-orange-600">LOTE #{lot.lot_number}</Badge>
                    <h1 className="text-3xl font-bold text-slate-900">{lot.title}</h1>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full"><Heart size={18} /></Button>
                    <Button variant="outline" size="icon" className="rounded-full"><Share2 size={18} /></Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Gauge size={20} /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Quilometragem</p>
                      <p className="font-bold text-slate-700">15.000 km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Fuel size={20} /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Combustível</p>
                      <p className="font-bold text-slate-700">Gasolina</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Settings2 size={20} /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Câmbio</p>
                      <p className="font-bold text-slate-700">Automático</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Palette size={20} /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Cor</p>
                      <p className="font-bold text-slate-700">Branco</p>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          <div className="lg:col-span-4">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden sticky top-24">
              <div className="bg-slate-900 p-6 text-white text-center">
                <div className="flex items-center justify-center gap-2 text-orange-500 mb-2">
                  <Clock size={18} className="animate-pulse" />
                  <span className="text-sm font-bold uppercase">Tempo Restante</span>
                </div>
                <CountdownTimer endsAt={lot.ends_at} />
              </div>
              
              <CardContent className="p-8 space-y-6">
                <div className="text-center">
                  <p className="text-sm text-slate-500 uppercase font-bold">Lance Atual</p>
                  <p className="text-4xl font-black text-slate-900">{formatCurrency(lot.current_bid)}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bid-amount" className="text-slate-600">Seu Lance</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                      <Input 
                        id="bid-amount"
                        type="number" 
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="text-2xl font-bold h-16 pl-12 text-center rounded-xl border-2 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-center text-slate-400">
                    Incremento mínimo obrigatório: <span className="font-bold text-slate-600">{formatCurrency(minIncrement)}</span>
                  </p>
                  <Button 
                    onClick={handleBid}
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 rounded-2xl text-xl font-black shadow-lg transition-all active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'CONFIRMAR LANCE'}
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                  <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                  <p className="text-[10px] text-blue-800 leading-tight">
                    Este leilão possui <strong>Anti-Sniper</strong>. Lances nos últimos 2 minutos estendem o tempo automaticamente para garantir a disputa franca.
                  </p>
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