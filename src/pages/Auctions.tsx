"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Car, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

const Auctions = () => {
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchAuctions = async () => {
    try {
      // Consumindo a API profissional que criamos
      const response = await fetch('http://localhost:3001/api/admin/auctions');
      if (!response.ok) throw new Error('Erro ao carregar leilões');
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error("Erro ao buscar leilões:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAuctions();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Carregando leilões ativos...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Leilões Ativos</h1>
            <p className="text-slate-600">Explore as melhores oportunidades em veículos selecionados diretamente do nosso banco de dados.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar leilão..." className="pl-10 bg-white border-none shadow-sm rounded-xl" />
            </div>
            <Button variant="outline" className="bg-white border-none shadow-sm rounded-xl">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        {auctions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
            <Car className="mx-auto h-16 w-16 text-slate-200 mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Nenhum leilão no momento</h2>
            <p className="text-slate-500">Fique atento, novos eventos são cadastrados diariamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions.map((auction) => (
              <Card key={auction.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                  {/* Imagem padrão caso não haja uma específica no banco */}
                  <img 
                    src={auction.image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'} 
                    alt={auction.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {new Date() >= new Date(auction.startsAt) && new Date() <= new Date(auction.endsAt) ? (
                      <Badge className="bg-red-500 hover:bg-red-600 text-white border-none px-3 py-1 animate-pulse">
                        AO VIVO
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none px-3 py-1">
                        AGENDADO
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <MapPin size={14} className="text-orange-400" />
                      {auction.location}
                    </div>
                  </div>
                </div>
                
                <CardHeader className="p-6 pb-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {auction.title}
                  </h3>
                </CardHeader>
                
                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Lotes</p>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Car size={16} className="text-orange-500" />
                        {auction._count?.lots || 0} veículos
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Início</p>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Calendar size={16} className="text-orange-500" />
                        {new Date(auction.startsAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={16} className="text-orange-500" />
                      <span className="text-sm font-medium">Término:</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {new Date(auction.endsAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="p-6 pt-0">
                  <Link to={`/auctions/${auction.id}`} className="w-full">
                    <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white rounded-xl py-6 group/btn">
                      Ver Detalhes do Leilão
                      <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;