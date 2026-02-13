"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Car, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Auctions = () => {
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const { data: auctionsData } = await supabase
        .from('auctions')
        .select('*, lots(id)')
        .order('starts_at', { ascending: false });
      
      setAuctions(auctionsData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAuctions();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Leilões Ativos</h1>
            <p className="text-slate-600">Explore as melhores oportunidades em veículos selecionados.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar leilão..." className="pl-10 bg-white border-none shadow-sm rounded-xl" />
            </div>
            <Button variant="outline" className="bg-white border-none shadow-sm rounded-xl"><Filter className="mr-2 h-4 w-4" /> Filtros</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction) => (
            <Card key={auction.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                <img 
                  src={auction.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={auction.status === 'live' ? "bg-red-500 animate-pulse" : "bg-blue-500"}>
                    {auction.status === 'live' ? 'AO VIVO' : 'AGENDADO'}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-6 pb-2">
                <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{auction.title}</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Lotes</p>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700"><Car size={16} className="text-orange-500" /> {auction.lots?.length || 0} veículos</div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Início</p>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700"><Calendar size={16} className="text-orange-500" /> {new Date(auction.starts_at).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Link to={`/auctions/${auction.id}`} className="w-full">
                  <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white rounded-xl py-6 group/btn">
                    Ver Detalhes <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auctions;