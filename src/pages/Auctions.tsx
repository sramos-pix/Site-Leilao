import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Car, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock data for initial UI development
const MOCK_AUCTIONS = [
  {
    id: '1',
    title: 'Leilão de Frota Executiva - SP',
    status: 'live',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    location: 'São Paulo, SP',
    lot_count: 15,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '2',
    title: 'Retomados de Financiamento - Sul',
    status: 'scheduled',
    starts_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    ends_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    location: 'Curitiba, PR',
    lot_count: 42,
    image: 'https://images.unsplash.com/photo-1567818735868-e71b99932e29?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '3',
    title: 'Leilão de Motos e Utilitários',
    status: 'live',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 3600000 * 4).toISOString(),
    location: 'Rio de Janeiro, RJ',
    lot_count: 28,
    image: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=800',
  }
];

const Auctions = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Leilões Ativos</h1>
            <p className="text-slate-600">Explore as melhores oportunidades em veículos selecionados.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar leilão..." className="pl-10 bg-white border-none shadow-sm" />
            </div>
            <Button variant="outline" className="bg-white border-none shadow-sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_AUCTIONS.map((auction) => (
            <Card key={auction.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img 
                  src={auction.image} 
                  alt={auction.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {auction.status === 'live' ? (
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
                      {auction.lot_count} veículos
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Início</p>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Calendar size={16} className="text-orange-500" />
                      {formatDate(auction.starts_at).split(',')[0]}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={16} className="text-orange-500" />
                    <span className="text-sm font-medium">Termina em:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {auction.status === 'live' ? '02d 14h 35m' : '-- : -- : --'}
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
      </div>
    </div>
  );
};

export default Auctions;
