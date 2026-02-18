"use client";

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/lib/supabase';
import { Trophy, Car, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const MyWins = () => {
  const [wins, setWins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWins = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Chama a função RPC que busca os arremates do usuário
      const { data, error } = await supabase.rpc('get_user_wins', { p_user: user.id });
      
      if (!error) {
        setWins(data || []);
      }
      setIsLoading(false);
    };

    fetchWins();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-100">
            <Trophy size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">MEUS ARREMATES</h1>
            <p className="text-slate-500 text-sm">Veículos que você venceu no leilão.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : wins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wins.map((win) => (
              <div key={win.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="flex h-full">
                  <div className="w-1/3 relative overflow-hidden">
                    <img 
                      src={win.cover_image_url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-2 left-2 bg-green-500 border-none">VENCIDO</Badge>
                  </div>
                  
                  <div className="w-2/3 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Lote #{win.lot_number}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 leading-tight mb-2 line-clamp-1">{win.title}</h3>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <DollarSign size={12} className="text-green-500" />
                          <span>Preço Final: <strong className="text-slate-900">{formatCurrency(win.final_price)}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Calendar size={12} />
                          <span>Encerrado em: {new Date(win.ends_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <Link to={`/lots/${win.id}`} className="mt-4">
                      <Button className="w-full bg-slate-900 hover:bg-orange-600 text-white rounded-xl h-10 text-xs font-bold gap-2 transition-colors">
                        VER DETALHES <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 text-center border border-dashed border-slate-200">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nenhum arremate ainda</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-6">Você ainda não venceu nenhum leilão. Continue dando lances para conquistar seu veículo!</p>
            <Link to="/app/dashboard">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-8 font-bold">
                IR PARA O LEILÃO
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyWins;