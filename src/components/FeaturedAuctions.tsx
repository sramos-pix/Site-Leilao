"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Clock, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
          // Em caso de erro, define um array vazio para evitar quebras
          setFeaturedLots([]);
        } else {
          // Garante que data é um array antes de definir o estado
          setFeaturedLots(data || []);
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar destaques:", error);
        // Em caso de erro inesperado, define um array vazio
        setFeaturedLots([]);
      }
    };

    fetchFeaturedLots();
  }, []);

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
            {/* Garante que featuredLots é um array antes de mapear */}
            {Array.isArray(featuredLots) && featuredLots.length > 0 ? (
              featuredLots.map((item) => (
                <div key={item.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%]">
                  <Card className="group border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {/* Adiciona verificação para a URL da imagem */}
                      {item.cover_image_url ? (
                        <img 
                          src={item.cover_image_url} 
                          alt={item.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          {/* Ícone ou texto indicando que a imagem não está disponível */}
                          <span>Sem Imagem</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-red-500 text-white border-none px-3 py-1 flex items-center gap-1 rounded-full">
                          <Clock size={12} /> 
                          <CountdownTimer randomScarcity={true} />
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-1">{item.title}</h3>
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl mb-6">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Lance Atual</p>
                          <p className="text-lg font-black text-slate-900">{formatCurrency(item.start_bid)}</p>
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
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 italic">
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