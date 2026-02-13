"use client";

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Info, Gavel, Clock, ChevronRight, ShieldCheck, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = React.useState<any>(null);
  const [lots, setLots] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: auctionData } = await supabase.from('auctions').select('*').eq('id', id).single();
      const { data: lotsData } = await supabase.from('lots').select('*').eq('auction_id', id).order('lot_number', { ascending: true });
      setAuction(auctionData);
      setLots(lotsData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-orange-500" /></div>;
  if (!auction) return <div className="text-center py-20">Leilão não encontrado.</div>;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="bg-slate-900 text-white pt-12 pb-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="max-w-3xl">
                <Badge className="bg-orange-500 mb-4">LEILÃO {auction.status === 'live' ? 'AO VIVO' : 'AGENDADO'}</Badge>
                <h1 className="text-3xl md:text-5xl font-bold mb-6">{auction.title}</h1>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3"><Calendar className="text-orange-500" /> <div><p className="text-xs text-slate-500 uppercase">Início</p><p className="font-semibold">{formatDate(auction.starts_at)}</p></div></div>
                  <div className="flex items-center gap-3"><MapPin className="text-orange-500" /> <div><p className="text-xs text-slate-500 uppercase">Local</p><p className="font-semibold">{auction.location}</p></div></div>
                </div>
              </div>
              <Card className="w-full md:w-80 bg-white/5 border-white/10 backdrop-blur-sm text-white">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2"><p className="text-sm text-slate-400">Taxa do Comprador</p><p className="text-2xl font-bold text-orange-500">5%</p></div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 py-6 rounded-xl font-bold">Habilitar-se para Lances</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-12 pb-20">
          <Tabs defaultValue="lots">
            <TabsList className="bg-white p-1 rounded-2xl shadow-sm mb-8">
              <TabsTrigger value="lots" className="rounded-xl px-8 py-3">Lotes ({lots.length})</TabsTrigger>
              <TabsTrigger value="info" className="rounded-xl px-8 py-3">Informações</TabsTrigger>
            </TabsList>

            <TabsContent value="lots">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {lots.map((lot) => (
                  <Card key={lot.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white">
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <img src={lot.cover_image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      <Badge className="absolute top-4 left-4 bg-slate-900/80">LOTE {lot.lot_number}</Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-1">{lot.title}</h3>
                      <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Lance Atual</p>
                        <p className="text-2xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                      </div>
                      <Link to={`/lots/${lot.id}`}><Button variant="outline" className="w-full border-2 rounded-xl py-6 font-bold">Ver Detalhes e Lances</Button></Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuctionDetail;