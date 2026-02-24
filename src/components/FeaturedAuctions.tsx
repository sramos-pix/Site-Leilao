"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Gavel, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import CountdownTimer from './CountdownTimer';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const FeaturedAuctions = () => {
  const [featuredLots, setFeaturedLots] = useState<any[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const { data: lotsData, error: lotsError } = await supabase
        .from('lots')
        .select('*')
        .eq('is_weekly_highlight', true)
        .order('created_at', { ascending: false });

      if (lotsError) throw lotsError;
      
      let fetchedLots = lotsData || [];
      // Embaralha os resultados (shuffle)
      for (let i = fetchedLots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fetchedLots[i], fetchedLots[j]] = [fetchedLots[j], fetchedLots[i]];
      }
      // Limita a 12 itens
      fetchedLots = fetchedLots.slice(0, 12);
      
      setFeaturedLots(fetchedLots);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: favsData } = await supabase
          .from('favorites')
          .select('lot_id')
          .eq('user_id', user.id);
        
        setUserFavorites(favsData?.map(f => f.lot_id) || []);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleFavorite = async (lotId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar logado para favoritar itens.",
        variant: "destructive"
      });
      return;
    }

    const isFavorited = userFavorites.includes(lotId);

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('lot_id', lotId);
        
        setUserFavorites(prev => prev.filter(id => id !== lotId));
        toast({ title: "Removido dos favoritos" });
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, lot_id: lotId });
        
        setUserFavorites(prev => [...prev, lotId]);
        toast({ title: "Adicionado aos favoritos!" });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seus favoritos.",
        variant: "destructive"
      });
    }
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none mb-4 px-4 py-1 rounded-full font-bold">
              OPORTUNIDADES
            </Badge>
            <h2 className="text-4xl font-black text-slate-900">Destaques da Semana</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(featuredLots) && featuredLots.length > 0 ? (
            featuredLots.map((item) => (
              <Card key={item.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white flex flex-col">
                
                {/* Container da Imagem corrigido */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* Link envolvendo apenas a imagem */}
                  <Link to={`/lots/${item.id}`} className="block w-full h-full">
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
                  </Link>

                  {/* Badges (pointer-events-none para não bloquear o clique na imagem) */}
                  <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
                    <Badge className="bg-slate-900 text-white border-none px-3 py-1 flex items-center gap-1 rounded-none text-[11px] font-bold uppercase tracking-tight">
                      LOTE #{item.lot_number}
                    </Badge>
                    <Badge className="bg-red-500 text-white border-none px-3 py-1 flex items-center gap-1 rounded-full text-[11px] font-bold">
                      <Clock size={12} /> 
                      <CountdownTimer randomScarcity={true} lotId={item.id} />
                    </Badge>
                  </div>

                  {/* Botão de Favorito (separado do Link principal) */}
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className={cn(
                      "absolute top-4 right-4 rounded-full backdrop-blur-md border-none shadow-sm transition-all duration-300 z-10",
                      userFavorites.includes(item.id) 
                        ? "bg-red-500 text-white hover:bg-red-600" 
                        : "bg-white/90 text-slate-600 hover:bg-orange-500 hover:text-white"
                    )}
                  >
                    <Heart size={18} fill={userFavorites.includes(item.id) ? "currentColor" : "none"} />
                  </Button>
                </div>

                <CardContent className="p-8 flex-1">
                  <Link to={`/lots/${item.id}`}>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center mt-auto">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Lance Atual</p>
                      <p className="text-2xl font-black text-slate-900">{formatCurrency(item.current_bid || item.start_bid)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Incremento</p>
                      <p className="text-sm font-bold text-slate-600">
                        + {formatCurrency(item.bid_increment || 500)}
                      </p>
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
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-slate-400 italic w-full bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              Nenhum destaque da semana encontrado.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAuctions;