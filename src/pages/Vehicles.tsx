"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Car, Calendar, Gauge, Loader2, Lock, Heart, Clock, Filter, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';
import CountdownTimer from '@/components/CountdownTimer';
import { SEO } from '@/components/SEO';

const Vehicles = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtros
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { toast } = useToast();

  // Extrair marcas e modelos únicos para os filtros
  const brands = Array.from(new Set(lots.map(lot => lot.brand).filter(Boolean))).sort();
  
  // Modelos disponíveis baseados na marca selecionada
  const availableModels = Array.from(
    new Set(
      lots
        .filter(lot => selectedBrand === "all" || lot.brand === selectedBrand)
        .map(lot => lot.model)
        .filter(Boolean)
    )
  ).sort();

  const fetchData = async () => {
    setLoading(true);
    
    // Busca os lotes. O valor real é o current_bid ou start_bid.
    const { data: lotsData, error: lotsError } = await supabase
      .from('lots')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!lotsError && lotsData) {
      setLots(lotsData);
    }

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
    
    // Escuta mudanças em lances e lotes para atualizar os preços nos cards em tempo real
    const channel = supabase.channel('public:vehicles_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, fetchData)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lots' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, lotId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Acesso restrito", description: "Faça login para favoritar.", variant: "destructive" });
      return;
    }

    const isFavorite = favorites.includes(lotId);
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('lot_id', lotId);
      setFavorites(prev => prev.filter(id => id !== lotId));
    } else {
      await supabase.from('favorites').insert({ user_id: session.user.id, lot_id: lotId });
      setFavorites(prev => [...prev, lotId]);
      toast({ title: "Adicionado aos favoritos" });
    }
  };

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lot.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lot.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = selectedBrand === "all" || lot.brand === selectedBrand;
    const matchesModel = selectedModel === "all" || lot.model === selectedModel;

    return matchesSearch && matchesBrand && matchesModel;
  });

  const clearFilters = () => {
    setSelectedBrand("all");
    setSelectedModel("all");
    setSearchTerm("");
  };

  // Schema Markup para a página de listagem (CollectionPage)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Todos os Veículos em Leilão - AutoBid",
    "description": "Explore nossa frota completa de veículos disponíveis para leilão. Filtre por marca, modelo e encontre o carro ideal.",
    "url": "https://autobid.com.br/vehicles"
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEO
        title="Todos os Veículos em Leilão | AutoBid"
        description="Explore nossa frota completa de veículos disponíveis para leilão. Filtre por marca, modelo e encontre o carro ideal. Carros, motos e caminhões."
        keywords="leilão de carros, leilão de motos, comprar carro barato, carros de frota, leilão de veículos, autobid, veículos seminovos"
        schema={schemaData}
      />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Todos os Veículos</h1>
            <p className="text-slate-500">Explore nossa frota completa disponível para leilão.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Buscar por título, marca ou modelo..."
                className="pl-10 h-12 rounded-xl border-slate-200 bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant={isFilterOpen || selectedBrand !== "all" || selectedModel !== "all" ? "default" : "outline"}
              className={cn(
                "h-12 rounded-xl gap-2 font-bold transition-all",
                (isFilterOpen || selectedBrand !== "all" || selectedModel !== "all")
                  ? "bg-orange-500 hover:bg-orange-600 text-white border-none"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              <Filter size={18} />
              Filtros
              {(selectedBrand !== "all" || selectedModel !== "all") && (
                <Badge className="ml-1 bg-white/20 text-white hover:bg-white/30 border-none px-1.5 py-0.5 text-[10px]">
                  Ativos
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Painel de Filtros */}
        {isFilterOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Filter size={18} className="text-orange-500" />
                Filtrar Veículos
              </h3>
              {(selectedBrand !== "all" || selectedModel !== "all" || searchTerm !== "") && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-red-500 h-8 px-2 text-xs font-bold">
                  <X size={14} className="mr-1" /> Limpar Filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marca</label>
                <select
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-700 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setSelectedModel("all"); // Reseta o modelo ao trocar a marca
                  }}
                >
                  <option value="all">Todas as Marcas</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modelo</label>
                <select
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-700 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={selectedBrand === "all" && availableModels.length === 0}
                >
                  <option value="all">Todos os Modelos</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">
                {filteredLots.length} {filteredLots.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}
              </span>
              <Button
                onClick={() => setIsFilterOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold px-6"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLots.map((lot) => {
              const isFinished = lot.status === 'finished';
              const isFav = favorites.includes(lot.id);
              const currentPrice = Math.max(lot.current_bid || 0, lot.start_bid || 0);
              
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
                        </div>
                      ) : (
                        <>
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold">
                              Lote #{lot.lot_number}
                            </Badge>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <Badge className="bg-red-500/90 backdrop-blur-md text-white border-none font-black flex items-center justify-center gap-2 py-1.5 shadow-lg">
                              <Clock size={14} className="animate-pulse" />
                              <CountdownTimer endsAt={lot.ends_at} lotId={lot.id} />
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className={cn("font-bold text-lg line-clamp-1", isFinished ? "text-slate-400" : "text-slate-900")}>
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
                          <p className={cn("text-lg font-black", isFinished ? "text-slate-500" : "text-orange-500")}>
                            {formatCurrency(currentPrice)}
                          </p>
                        </div>
                        <Button size="sm" className={cn("rounded-xl px-4 font-bold", isFinished ? "bg-slate-100 text-slate-400" : "bg-slate-900 hover:bg-orange-500 text-white")}>
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
      </main>

      <Footer />
    </div>
  );
};

export default Vehicles;