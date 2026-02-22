"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Calendar, Car, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const FeaturedLots = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select('*, lots(id)')
        .order('starts_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      setAuctions(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

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

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none mb-4 px-4 py-1 rounded-full font-bold">
              LEILÕES EM DESTAQUE
            </Badge>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Oportunidades Imperdíveis</h2>
            <p className="text-slate-500 mt-2 font-medium">Confira os eventos de leilão mais recentes</p>
          </div>
          <Link to="/auctions">
            <Button variant="ghost" className="text-orange-600 font-bold hover:text-orange-700 hover:bg-orange-50 group">
              Ver todos os leilões <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions.map((auction) => {
              const statusInfo = getStatusInfo(auction.status);
              return (
                <Card key={auction.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white">
                  
                  {/* Container da Imagem corrigido */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    <Link to={`/auctions/${auction.id}`} className="block w-full h-full">
                      <img 
                        src={auction.image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        alt={auction.title}
                      />
                    </Link>
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <Badge className={cn(
                        "border-none font-bold px-3 py-0.5 rounded-full text-[10px] tracking-wider",
                        statusInfo.class
                      )}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <Link to={`/auctions/${auction.id}`}>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1 tracking-tight mb-4 hover:text-orange-600 transition-colors">{auction.title}</h3>
                    </Link>
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
                  <CardFooter className="p-6 pt-0">
                    <Link to={`/auctions/${auction.id}`} className="w-full">
                      <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white rounded-xl h-11 font-bold group/btn transition-all">
                        Ver Veículos <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">Nenhum leilão ativo no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedLots;