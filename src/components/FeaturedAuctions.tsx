"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Clock, Gavel, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import CountdownTimer from './CountdownTimer';
import { supabase } from '@/lib/supabase';

const FeaturedAuctions = () => {
  const [featuredLots, setFeaturedLots] = useState([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true });

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    const fetchFeaturedLots = async () => {
      try {
        const { data, error } = await supabase
          .from('lots')
          .select('*')
          .eq('is_weekly_highlight', true);

        if (error) {
          console.error("Erro ao buscar destaques:", error);
          setFeaturedLots([]);
        } else {
          setFeaturedLots(data || []);
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar destaques:", error);
        setFeaturedLots([]);
      }
    };

    fetchFeaturedLots();
  }, []);

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none mb-4 px-4 py-1 rounded-full font-bold">
              DESTAQUES DA SEMANA
            </Badge>
            <h2 className="text-4xl font-black text-slate-900">Oportunidades Imperdíveis</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={scrollPrev} className="rounded-full bg-white border-none shadow-sm hover:bg-orange-50">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={scrollNext} className="rounded-full bg-white border-none shadow-sm hover:bg-orange-50">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Aumentado o padding vertical (py-12) e margem negativa (-my-12) para acomodar sombras grandes */}
        <div className="overflow-hidden -my-12 py-12" ref={emblaRef}>
          <div className="flex gap-4">
            {Array.isArray(featuredLots) && featuredLots.length > 0 ? (
              featuredLots.map((item) => (
                <div key={item.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] px-2">
                  <Card className="group border-none shadow-lg hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {item.cover_image_url ? (
                        <img 
                          src={item.cover_image_url} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-400 font-bold">Sem Imagem</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-slate-900 text-white border-none px-3 py-1 flex items-center gap-1 rounded-none text-[11px] font-bold uppercase tracking-tight">
                          LOTE #{item.lot_number}
                        </Badge>
                        <Badge className="bg-red-500 text-white border-none px-3 py-1 flex items-center gap-1 rounded-full text-[11px] font-bold">
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
                        {item.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Lance Atual</p>
                          <p className="text-2xl font-black text-slate-900">{formatCurrency(item.current_bid || item.start_bid)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Incremento</p>
                          <p className="text-sm font-bold text-slate-600">+ R$ 2.000</p>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-8 pt-0">
                      <Link to={`/lots/${item.id}`} className="w-full">
                        <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                          <Gavel size={18} className="group-hover/btn:rotate-12 transition-transform" />
                          DAR LANCE AGORA
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-400 italic w-full bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                Nenhum destaque da semana encontrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAuctions;