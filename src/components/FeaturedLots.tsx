"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Clock, Heart, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import CountdownTimer from './CountdownTimer';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const FeaturedLots = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Busca lotes que pertencem a leilões com status 'active'
      const { data, error } = await supabase
        .from('lots')
        .select(`
          *,
          auctions!inner(status)
        `)
        .eq('auctions.status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setLots(data || []);

      // Busca favoritos do usuário se estiver logado
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: favs } = await supabase
          .from('favorites')
          .select('lot_id')
          .eq('user_id', user.id);
        setUserFavorites(favs?.map(f => f.lot_id) || []);
      }
    } catch (error) {
      console.error("Erro ao buscar lotes ativos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, lotId: string) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar logado para favoritar.",
        variant: "destructive"
      });
      return;
    }

    const isFavorited = userFavorites.includes(lotId);
    try {
      if (isFavorited) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('lot_id', lotId);
        setUserFavorites(prev => prev.filter(id => id !== lotId));
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, lot_id: lotId });
        setUserFavorites(prev => [...prev, lotId]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none mb-4 px-4 py-1 rounded-full font-bold">
              LEILÕES ATIVOS
            </Badge>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Oportunidades em Destaque</h2>
            <p className="text-slate-500 mt-2 font-medium">Confira os lotes mais disputados do momento</p>
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
        ) : lots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lots.map((lot) => (
              <Card key={lot.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-slate-50">
                <Link to={`/lots/${lot.id}`} className="block relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={lot.cover_image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'} 
                    alt={lot.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-slate-900/90 backdrop-blur-md text-white border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                      LOTE #{lot.lot_number}
                    </Badge>
                    <Badge className="bg-red-500 text-white border-none px-3 py-1 flex items-center gap-1 rounded-full text-[10px] font-black shadow-lg shadow-red-500/20 w-fit">
                      <Clock size={12} /> 
                      <CountdownTimer randomScarcity={true} lotId={lot.id} />
                    </Badge>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className={cn(
                      "absolute top-4 right-4 rounded-full backdrop-blur-md border-none shadow-sm transition-all duration-300",
                      userFavorites.includes(lot.id) ? "bg-red-500 text-white" : "bg-white/90 hover:bg-orange-500 hover:text-white"
                    )}
                    onClick={(e) => toggleFavorite(e, lot.id)}
                  >
                    <Heart size={18} fill={userFavorites.includes(lot.id) ? "currentColor" : "none"} />
                  </Button>
                </Link>

                <CardContent className="p-8">
                  <Link to={`/lots/${lot.id}`}>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {lot.title}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Lance Atual</p>
                      <p className="text-2xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Incremento</p>
                      <p className="text-sm font-bold text-slate-600">+ {formatCurrency(lot.bid_increment || 500)}</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-8 pt-0">
                  <Link to={`/lots/${lot.id}`} className="w-full">
                    <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white font-black py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-xl shadow-slate-200">
                      <Gavel size={18} className="group-hover/btn:rotate-12 transition-transform" />
                      DAR LANCE AGORA
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
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