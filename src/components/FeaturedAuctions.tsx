"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Clock, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

const MOCK_FEATURED = [
  {
    id: 'l1',
    title: 'BMW 320i M Sport 2022',
    current_bid: 215000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    ends_at: '2h 15m',
  },
  {
    id: 'l2',
    title: 'Audi A4 Performance 2021',
    current_bid: 185000,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800',
    ends_at: '5h 40m',
  },
  {
    id: 'l3',
    title: 'Mercedes-Benz C300 AMG',
    current_bid: 245000,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
    ends_at: '1d 02h',
  },
  {
    id: 'l4',
    title: 'Porsche Macan T 2023',
    current_bid: 420000,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    ends_at: '45m',
  }
];

const FeaturedAuctions = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true });

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Destaques da Semana</h2>
            <p className="text-slate-600">Os veículos mais disputados do momento.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={scrollPrev} className="rounded-full bg-white border-none shadow-sm">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={scrollNext} className="rounded-full bg-white border-none shadow-sm">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {MOCK_FEATURED.map((item) => (
              <div key={item.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%]">
                <Card className="group border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500 text-white border-none px-3 py-1 flex items-center gap-1">
                        <Clock size={12} /> {item.ends_at}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-1">{item.title}</h3>
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl mb-6">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Lance Atual</p>
                        <p className="text-lg font-black text-slate-900">{formatCurrency(item.current_bid)}</p>
                      </div>
                      <Gavel className="text-orange-500" size={24} />
                    </div>
                    <Link to={`/lots/${item.id}`}>
                      <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white rounded-xl py-6 font-bold transition-colors">
                        Dar Lance
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAuctions;