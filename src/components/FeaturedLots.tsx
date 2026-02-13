"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Clock, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import CountdownTimer from './CountdownTimer';

const MOCK_LOTS = [
  {
    id: 'l1',
    title: 'BMW 320i M Sport 2022',
    current_bid: 215000,
    km: '15.000',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    ends_in: '02:14:05',
    is_hot: true
  },
  {
    id: 'l2',
    title: 'Audi A4 Performance 2021',
    current_bid: 185000,
    km: '28.000',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800',
    ends_in: '05:30:12',
    is_hot: false
  },
  {
    id: 'l3',
    title: 'Mercedes-Benz C300 AMG',
    current_bid: 245000,
    km: '12.500',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
    ends_in: '01:15:45',
    is_hot: true
  },
  {
    id: 'l4',
    title: 'Porsche Macan T 2023',
    current_bid: 420000,
    km: '5.200',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    ends_in: '00:45:00',
    is_hot: true
  }
];

const FeaturedLots = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Oportunidades em Destaque</h2>
            <p className="text-slate-600">Veículos selecionados com os melhores lances iniciais.</p>
          </div>
          <Link to="/auctions">
            <Button variant="outline" className="rounded-xl border-2 font-bold">
              Ver todos os lotes
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_LOTS.map((lot) => (
            <Card key={lot.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-slate-50/50">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={lot.image} 
                  alt={lot.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {lot.is_hot && (
                    <Badge className="bg-orange-500 text-white border-none px-3 py-1 animate-pulse">
                      DISPUTADO
                    </Badge>
                  )}
                  <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-none px-3 py-1 flex items-center gap-1">
                    <Clock size={12} /> 
                    <CountdownTimer initialTime={lot.ends_in} />
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{lot.title}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
                  <Gauge size={14} /> {lot.km} km • Automático
                </div>
                
                <div className="bg-white p-4 rounded-2xl mb-4 border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Lance Atual</p>
                  <p className="text-xl font-black text-slate-900">{formatCurrency(lot.current_bid)}</p>
                </div>

                <Link to={`/lots/${lot.id}`}>
                  <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white rounded-xl py-5 font-bold transition-colors group/btn">
                    Dar Lance
                    <Gavel size={16} className="ml-2 group-hover/btn:rotate-12 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedLots;