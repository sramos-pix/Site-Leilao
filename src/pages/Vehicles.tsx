"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Gavel, Clock, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';

const Vehicles = () => {
  const [lots, setLots] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  const fetchLots = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('lots')
        .select('*')
        .order('created_at', { ascending: false });
      setLots(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLots();
  }, []);

  const filteredLots = lots.filter(lot => 
    lot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">Todos os Veículos</h1>
              <p className="text-slate-500">Encontre a melhor oportunidade entre centenas de lotes ativos.</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Marca, modelo ou lote..." 
                  className="pl-10 h-12 bg-white border-none shadow-sm rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-12 bg-white border-none shadow-sm rounded-xl px-6">
                <Filter size={18} className="mr-2" /> Filtros
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={48} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLots.map((lot) => (
                <Card key={lot.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={lot.cover_image_url || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'} 
                      alt={lot.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-slate-900 text-white border-none px-3 py-1 rounded-none text-[11px] font-bold uppercase">LOTE #{lot.lot_number}</Badge>
                      <Badge className="bg-orange-500 text-white border-none px-4 py-1.5 rounded-full text-[11px] font-black flex items-center gap-2 shadow-lg shadow-orange-500/30">
                        <Clock size={14} className="animate-pulse" /> 
                        <CountdownTimer randomScarcity={true} lotId={lot.id} />
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
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-orange-600 transition-colors line-clamp-1">{lot.title}</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Lance Atual</p>
                        <p className="text-2xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Incremento</p>
                        <p className="text-sm font-bold text-slate-600">
                          + {formatCurrency(lot.bid_increment || 500)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                    <Link to={`/lots/${lot.id}`} className="w-full">
                      <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold py-6 rounded-2xl transition-all flex items-center justify-center gap-2 group/btn">
                        <Gavel size={18} className="group-hover/btn:rotate-12 transition-transform" />
                        DAR LANCE AGORA
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Vehicles;