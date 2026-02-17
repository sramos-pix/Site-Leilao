"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Car, Calendar, Gauge, MapPin, Loader2, Lock, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';

const Vehicles = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: lotsData, error: lotsError } = await supabase
      .from('lots')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!lotsError) setLots(lotsData || []);

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: favsData } = await supabase
        .from('favorites')
        .select('lot_id')
        .eq('user_id', session.user.id);
      
      if (favsData) setFavorites(favsData.map(f => f.lot_id));
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, lotId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Acesso restrito",
        description: "Faça login para favoritar veículos.",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = favorites.includes(lotId);

    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('lot_id', lotId);

      if (!error) {
        setFavorites(prev => prev.filter(id => id !== lotId));
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: session.user.id, lot_id: lotId });

      if (!error) {
        setFavorites(prev => [...prev, lotId]);
        toast({
          title: "Adicionado aos favoritos",
          description: "O veículo foi salvo na sua lista.",
        });
      }
    }
  };

  const filteredLots = lots.filter(lot => 
    lot.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Todos os Veículos</h1>
            <p className="text-slate-500">Explore nossa frota completa disponível para leilão.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Buscar por marca ou modelo..." 
              className="pl-10 h-12 rounded-xl border-slate-200 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLots.map((lot) => {
              const isFinished = lot.status === 'finished';
              const isFav = favorites.includes(lot.id);
              
              return (
                <Link key={lot.id} to={`/lots/${lot.id}`} className="group">
                  <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[4/3] relative overflow-hidden bg-slate-200">
                      <img 
                        src={lot.cover_image_url} 
                        alt={lot.title} 
                        className={cn(
                          "w-full h-full object-cover transition-all duration-500",
                          isFinished ? "blur-[2px] grayscale-[0.5] brightness-[0.6] scale-105" : "group-hover:scale-110"
                        )}
                      />
                      
                      {/* Botão de Favorito */}
                      {!isFinished && (
                        <button
                          onClick={(e) => toggleFavorite(e, lot.id)}
                          className={cn(
                            "absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300",
                            isFav ? "bg-orange-500 text-white" : "bg-white/80 text-slate-600 hover:bg-white"
                          )}
                        >
                          <Heart size={18} fill={isFav ? "currentColor" : "none"} />
                        </button>
                      )}

                      {isFinished ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900/40 backdrop-blur-[1px]">
                          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-2 rounded-full mb-2">
                            <Lock className="text-white" size={18} />
                          </div>
                          <span className="text-white font-black text-base tracking-tighter uppercase drop-shadow-md">
                            ARREMATADO
                          </span>
                          <span className="text-white/80 text-[9px] font-bold uppercase tracking-widest">
                            Finalizado
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold">
                            Lote #{lot.lot_number}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className={cn(
                          "font-bold text-lg line-clamp-1",
                          isFinished ? "text-slate-400" : "text-slate-900"
                        )}>
                          {lot.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-slate-500 text-xs font-medium">
                          <span className="flex items-center gap-1"><Calendar size={14} /> {lot.year}</span>
                          <span className="flex items-center gap-1"><Gauge size={14} /> {lot.mileage_km?.toLocaleString()} km</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {isFinished ? "Vendido por" : "Lance Atual"}
                          </p>
                          <p className={cn(
                            "text-lg font-black",
                            isFinished ? "text-slate-500" : "text-orange-500"
                          )}>
                            {formatCurrency(lot.current_bid || lot.start_bid)}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          className={cn(
                            "rounded-xl px-4 transition-colors font-bold",
                            isFinished 
                              ? "bg-slate-100 text-slate-400 hover:bg-slate-100" 
                              : "bg-slate-900 hover:bg-orange-500 text-white"
                          )}
                        >
                          {isFinished ? "Ver Resultado" : "Ver Detalhes"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredLots.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-100">
            <Car className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-900">Nenhum veículo encontrado</h3>
            <p className="text-slate-500">Tente ajustar sua busca ou filtros.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Vehicles;