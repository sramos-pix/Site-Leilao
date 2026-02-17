"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Gavel, Clock, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/use-toast';

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          lot_id,
          lots (
            id,
            title,
            cover_image_url,
            current_bid,
            start_bid,
            ends_at,
            status
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar favoritos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (favId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favId);

      if (error) throw error;
      
      setFavorites(prev => prev.filter(f => f.id !== favId));
      toast({ title: "Removido", description: "Veículo removido dos favoritos." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover." });
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <AppLayout>
      <div className="mb-8">
        <Link to="/app/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors mb-4 font-bold text-sm">
          <ArrowLeft size={16} /> Voltar ao Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Meus Favoritos</h1>
        <p className="text-slate-500 font-medium">Veículos que você demonstrou interesse.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="text-slate-400 font-bold">Carregando seus favoritos...</p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const lot = fav.lots;
            if (!lot) return null;
            
            return (
              <Card key={fav.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white group hover:shadow-md transition-all">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={lot.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={lot.title} 
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-3 right-3 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFavorite(fav.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">{lot.title}</h3>
                    <Badge className="bg-orange-50 text-orange-600 border-none font-bold text-[10px]">
                      {lot.status === 'active' ? 'ATIVO' : 'ENCERRADO'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400 mb-4">
                    <Clock size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Expira em {new Date(lot.ends_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Lance Atual</p>
                      <p className="font-bold text-slate-900 text-lg">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                    </div>
                    <Link to={`/lots/${lot.id}`}>
                      <Button className="rounded-xl bg-slate-900 hover:bg-orange-600 text-white font-bold px-4 h-9 text-xs">
                        Dar Lance
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-red-200" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum favorito ainda</h3>
          <p className="text-slate-400 text-sm font-medium mb-6 max-w-xs mx-auto">
            Você ainda não salvou nenhum veículo. Explore os leilões e clique no coração para salvar.
          </p>
          <Link to="/auctions">
            <Button className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 h-11">
              Explorar Leilões
            </Button>
          </Link>
        </div>
      )}
    </AppLayout>
  );
};

export default Favorites;