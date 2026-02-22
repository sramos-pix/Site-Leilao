"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, Car, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';

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
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    const normalizedStatus = (status || '').toLowerCase().trim();
    
    switch (normalizedStatus) {
      case 'live':
      case 'active':
      case 'ativo':
      case 'ao vivo':
        return { label: 'AO VIVO', class: 'bg-red-500 text-white animate-pulse' };
      case 'finished':
      case 'finalizado':
      case 'encerrado':
        return { label: 'FINALIZADO', class: 'bg-slate-500 text-white' };
      case 'scheduled':
      case 'agendado':
        return { label: 'AGENDADO', class: 'bg-blue-500 text-white' };
      default:
        return {
          label: status ? status.toUpperCase() : 'AGENDADO',
          class: 'bg-slate-800 text-white'
        };
    }
  };

  // Schema Markup para a página de leilões (Event)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": auctions.map((auction, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": auction.title,
        "startDate": auction.starts_at,
        "endDate": auction.ends_at,
        "eventStatus": auction.status === 'finished' ? "https://schema.org/EventRescheduled" : "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
        "location": {
          "@type": "VirtualLocation",
          "url": `https://autobidbr.com/auctions/${auction.id}`
        },
        "image": auction.image_url
      }
    }))
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <SEO
        title="Leilões Ativos de Veículos | AutoBid"
        description="Confira os leilões de veículos ativos na AutoBid. Participe e dê seu lance em carros, motos e caminhões de frota e recuperados."
        keywords="leilões ativos, leilão de carros hoje, leilão online, participar de leilão, autobid"
        schema={schemaData}
      />
      <Navbar />
      <div className="container mx-auto px-4 py-10 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leilões Ativos</h1>
            <p className="text-slate-500 font-medium">Explore as melhores oportunidades em veículos selecionados.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar leilão..." className="pl-10 bg-white border-slate-200 shadow-sm rounded-xl h-11" />
            </div>
            <Button variant="outline" className="bg-white border-slate-200 shadow-sm rounded-xl h-11 px-5 font-semibold text-slate-600">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => {
            const statusInfo = getStatusInfo(auction.status);
            return (
              <Card key={auction.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white">
                <Link to={`/auctions/${auction.id}`} className="relative aspect-[16/9] overflow-hidden bg-slate-100 block">
                  <img 
                    src={auction.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    alt={auction.title}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={cn(
                      "border-none font-bold px-3 py-0.5 rounded-full text-[10px] tracking-wider",
                      statusInfo.class
                    )}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </Link>
                <CardHeader className="p-5 pb-2">
                  <Link to={`/auctions/${auction.id}`}>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 tracking-tight hover:text-orange-600 transition-colors">{auction.title}</h3>
                  </Link>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lotes</p>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                        <Car size={14} className="text-orange-500" /> {auction.lots?.length || 0} veículos
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Início</p>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                        <Calendar size={14} className="text-orange-500" /> {new Date(auction.starts_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Link to={`/auctions/${auction.id}`} className="w-full">
                    <Button 
                      className={cn(
                        "w-full rounded-xl h-11 font-bold group/btn transition-all",
                        statusInfo.label === 'FINALIZADO'
                          ? "bg-slate-200 text-slate-500 hover:bg-slate-300" 
                          : "bg-slate-900 hover:bg-orange-600 text-white"
                      )}
                    >
                      {statusInfo.label === 'FINALIZADO' ? 'Ver Resultados' : 'Ver Veículos'} 
                      <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auctions;