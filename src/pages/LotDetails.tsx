"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gavel, Clock, ShieldCheck } from 'lucide-react';

const LotDetails = () => {
  const { id } = useParams();
  const [lot, setLot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLot = async () => {
      const { data } = await supabase.from('lots').select('*').eq('id', id).single();
      setLot(data);
      setLoading(false);
    };
    fetchLot();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!lot) return <div className="min-h-screen flex items-center justify-center">Lote não encontrado.</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-video rounded-3xl overflow-hidden bg-slate-200">
              {lot.cover_image_url && <img src={lot.cover_image_url} alt={lot.title} className="w-full h-full object-cover" />}
            </div>
          </div>
          <div className="space-y-6">
            <Badge className="bg-orange-100 text-orange-600 border-none">LOTE #{lot.lot_number}</Badge>
            <h1 className="text-4xl font-black text-slate-900">{lot.title}</h1>
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
              <p className="text-slate-500 font-bold uppercase text-xs mb-2">Lance Atual</p>
              <p className="text-4xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
              <Button className="w-full mt-6 bg-slate-900 hover:bg-orange-600 py-8 rounded-2xl text-lg font-bold">
                <Gavel className="mr-2" /> DAR LANCE AGORA
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LotDetails;