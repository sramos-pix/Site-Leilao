"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Gavel, Heart, Lock } from 'lucide-react';
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
            featuredLots.map((item) => {
              const isFinished = item.force_finished || (item.ends_at ? new Date(item.ends_at) < new Date() : item.status === 'finished');
              return (
              <Card key={item.id} className="group border-none shadow-md hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white flex flex-col">

                {/* Container da Imagem */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Link to={`/lots/${item.id}`} className="block w-full h-full">
                    {item.cover_image_url ? (
                      <img
                        src={item.cover_image_url}
                        alt={item.title}
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-700",
                          isFinished ? "blur-[2px] grayscale-[0.5] brightness-[0.6] scale-105" : "group-hover:scale-110"
                        )}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <span className="text-slate-400 font-bold">Sem Imagem</span>
                      </div>
                    )}
                  </Link>

                  {isFinished ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/40 backdrop-blur-[1px] pointer-events-none">
                      <div className="bg-white/20 backdrop-blur-md border border-white/30 p-2 rounded-full mb-2">
                        <Lock className="text-white" size={18} />
                      </div>
                      <span className="text-white font-black text-base tracking-tighter uppercase drop-shadow-md">
                        ARREMATADO
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
                        <Badge className="bg-slate-900 text-white border-none px-3 py-1 flex items-center gap-1 rounded-none text-[11px] font-bold uppercase tracking-tight">
                          LOTE #{item.lot_number}
                        </Badge>
                        <Badge className="bg-red-500 text-white border-none px-3 py-1 flex items-center gap-1 rounded-full text-[11px] font-bold">
                          <Clock size={12} />
                          <CountdownTimer randomScarcity={true} lotId={item.id} />
                        </Badge>
                      </div>

                      {/* Botão de Favorito */}
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
                    </>
                  )}
                </div>

                <CardContent className="p-8 flex-1">
                  <Link to={`/lots/${item.id}`}>
                    <h3 className={cn("text-xl font-bold mb-4 transition-colors line-clamp-2", isFinished ? "text-slate-400" : "text-slate-900 group-hover:text-orange-600")}>
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center mt-auto">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{isFinished ? 'Vendido por' : 'Lance Atual'}</p>
                      <p className={cn("text-2xl font-black", isFinished ? "text-slate-500" : "text-slate-900")}>{formatCurrency(item.current_bid || item.start_bid)}</p>
                    </div>
                    {!isFinished && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Incremento</p>
                        <p className="text-sm font-bold text-slate-600">
                          + {formatCurrency(item.bid_increment || 500)}
                        </p>
                      </div>
                    )}
                  </div>
                  {!isFinished && item.fipe_value && Number(item.fipe_value) > 0 && (
                    <div className="mt-3 flex items-center justify-between bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
                      <span className="text-xs text-slate-500">FIPE: <span className="line-through">{formatCurrency(item.fipe_value)}</span></span>
                      <span className="text-xs font-black text-emerald-600">
                        {Math.round((1 - Number(item.start_bid) / Number(item.fipe_value)) * 100)}% abaixo
                      </span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-8 pt-0">
                  <Link to={`/lots/${item.id}`} className="w-full">
                    <Button className={cn("w-full font-bold py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn", isFinished ? "bg-slate-200 text-slate-500 hover:bg-slate-300" : "bg-slate-900 hover:bg-orange-600 text-white")}>
                      {isFinished ? 'Ver Resultado' : <><Gavel size={18} className="group-hover/btn:rotate-12 transition-transform" /> DAR LANCE AGORA</>}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
            })
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