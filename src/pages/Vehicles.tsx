"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Car, Calendar, Gauge, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Vehicles = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLots = async () => {
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setLots(data || []);
      setLoading(false);
    };
    fetchLots();
  }, []);

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
            {filteredLots.map((lot) => (
              <Link key={lot.id} to={`/lots/${lot.id}`} className="group">
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img 
                      src={lot.cover_image_url} 
                      alt={lot.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-bold">
                        Lote #{lot.lot_number}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{lot.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-slate-500 text-xs font-medium">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {lot.year}</span>
                        <span className="flex items-center gap-1"><Gauge size={14} /> {lot.mileage_km?.toLocaleString()} km</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lance Atual</p>
                        <p className="text-lg font-black text-orange-500">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                      </div>
                      <Button size="sm" className="bg-slate-900 hover:bg-orange-500 text-white rounded-xl px-4 transition-colors">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredLots.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
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