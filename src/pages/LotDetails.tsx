"use client";

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gavel, Clock, ShieldCheck, ChevronLeft, Share2, Heart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

const LotDetails = () => {
  const { id } = useParams();
  const [lot, setLot] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLot = async () => {
      const { data } = await supabase
        .from('lots')
        .select('*')
        .eq('id', id)
        .single();
      setLot(data);
      setLoading(false);
    };
    fetchLot();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!lot) return <div className="min-h-screen flex items-center justify-center">Lote não encontrado.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-orange-600 font-bold">
            <ChevronLeft size={20} /> Voltar
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full"><Share2 size={20} /></Button>
            <Button variant="ghost" size="icon" className="rounded-full"><Heart size={20} /></Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-slate-200 shadow-lg">
              <img src={lot.cover_image_url} alt={lot.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-orange-100 text-orange-600 border-none font-bold">LOTE #{lot.lot_number}</Badge>
                <Badge className="bg-slate-100 text-slate-600 border-none font-bold uppercase">{lot.category || 'Veículo'}</Badge>
              </div>
              <h1 className="text-3xl font-black text-slate-900">{lot.title}</h1>
              <p className="text-slate-600 leading-relaxed">{lot.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-2xl text-red-600">
                  <div className="flex items-center gap-2 font-bold"><Clock size={20} /> Encerra em:</div>
                  <div className="font-black">2d 04h 15m</div>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lance Atual</p>
                  <p className="text-4xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-8 rounded-2xl text-lg shadow-lg shadow-orange-200">
                    DAR LANCE AGORA
                  </Button>
                  <p className="text-center text-xs text-slate-400 font-medium">Incremento mínimo: {formatCurrency(lot.bid_increment || 500)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white">
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-3 text-orange-500 font-bold">
                  <ShieldCheck size={24} /> Compra Segura
                </div>
                <p className="text-sm text-slate-400">Este lote possui procedência verificada e garantia de entrega conforme edital.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LotDetails;