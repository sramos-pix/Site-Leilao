"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import HeroBanner from "@/components/HeroBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLots = async () => {
      const { data, error } = await supabase
        .from("lots")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);

      if (data) setLots(data);
      setLoading(false);
    };

    fetchLots();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      
      {/* AQUI ESTÁ O BANNER! Ele só vai aparecer se estiver ativo nas configurações */}
      <HeroBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lotes em Destaque</h2>
          <Link to="/leiloes" className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 transition-colors">
            Ver todos <ChevronRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        ) : lots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lots.map((lot) => (
              <Card key={lot.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 group hover:-translate-y-1 bg-white rounded-2xl">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {lot.cover_image_url ? (
                    <img 
                      src={lot.cover_image_url} 
                      alt={lot.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Sem imagem</div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-black text-slate-800 shadow-sm">
                    LOTE {lot.lot_number}
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">{lot.title}</h3>
                  <div className="flex items-center text-slate-500 text-sm mb-5 font-medium">
                    <Clock size={16} className="mr-1.5 text-orange-500" />
                    <span>Encerra em breve</span>
                  </div>
                  <div className="flex items-end justify-between mt-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Lance Atual</p>
                      <p className="text-2xl font-black text-slate-900">
                        R$ {(lot.current_bid || lot.start_bid).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Button asChild className="bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-bold shadow-md transition-colors">
                      <Link to={`/lote/${lot.id}`}>Dar Lance</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum lote ativo</h3>
            <p className="text-slate-500">Os leilões aparecerão aqui assim que forem iniciados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;