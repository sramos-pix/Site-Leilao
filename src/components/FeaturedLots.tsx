"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Clock, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import CountdownTimer from './CountdownTimer';

const FEATURED_LOTS = [
  {
    id: 'l1',
    title: 'BMW 320i M Sport 2022',
    current_bid: 215000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    lot_number: 1
  },
  {
    id: 'l2',
    title: 'Porsche 911 Carrera S 2021',
    current_bid: 850000,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    lot_number: 2
  },
  {
    id: 'l3',
    title: 'Mercedes-Benz G63 AMG 2023',
    current_bid: 1250000,
    image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800',
    lot_number: 3
  }
];

const FeaturedLots = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none mb-4 px-4 py-1 rounded-full font-bold">
              OPORTUNIDADES ÚNICAS
            </Badge>
            <h2 className="text-4xl font-black text-slate-900">Lotes em Destaque</h2>
          </div>
          <Link to="/auctions">
            <Button variant="ghost" className="text-orange-600 font-bold hover:text-orange-700 hover:bg-orange-50">
              Ver todos os lotes <ChevronRight size={20} className="ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_LOTS.map((lot) => (
            <Card key={lot.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-slate-50">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={lot.image} 
                  alt={lot.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-slate-900 text-white border-none px-3 py-1 flex items-center gap-1 text-[12px]">
                    LOTE #{lot.lot_number}
                  </Badge>
                  <Badge className="bg-red-500 text-white border-none px-3 py-1 flex items-center gap-1 text-[12px]">
                    <Clock size={12} /> 
                    <CountdownTimer randomScarcity={true} />
                  </Badge>
                </div>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-md border-none shadow-sm hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <Heart size={18} />
                </Button>
              </div>

              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {lot.title}
                </h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Lance Atual</p>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(lot.current_bid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Incremento</p>
                    <p className="text-sm font-bold text-slate-600">+ R$ 2.000</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-8 pt-0">
                <Link to={`/lots/${lot.id}`} className="w-full">
                  <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                    <Gavel size={18} className="group-hover/btn:rotate-12 transition-transform" />
                    DAR LANCE AGORA
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedLots;