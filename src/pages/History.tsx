"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gavel, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';

const History = () => {
  const [wins, setWins] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();

  const fetchWins = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc("get_user_wins", { p_user: user.id });

      if (error) {
        console.error("Erro RPC:", error);
        return;
      }
      setWins(data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWins();
    
    const channel = supabase
      .channel("history-realtime-v4")
      .on("postgres_changes", { event: "*", schema: "public", table: "bids" }, () => fetchWins())
      .on("postgres_changes", { event: "*", schema: "public", table: "lots" }, () => fetchWins())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchWins]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-orange-500" size={40} />
        <p className="text-slate-500 font-medium">Carregando seus arremates...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Meus Arremates</h1>
          <p className="text-slate-500">Veículos onde você detém o maior lance em leilões encerrados.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {wins.length > 0 ? wins.map((lot) => (
          <Card key={lot.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden hover:shadow-md transition-all bg-white border border-slate-100">
            <CardContent className="p-0 flex flex-col md:flex-row">
              <div className="w-full md:w-64 h-48 bg-slate-100 shrink-0 relative">
                <img 
                  src={lot.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} 
                  className="w-full h-full object-cover" 
                  alt={lot.title} 
                />
                <Badge className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border-none">
                  LOTE #{lot.lot_number}
                </Badge>
              </div>
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{lot.title}</h3>
                    <p className="text-sm text-slate-400">Encerrado em {new Date(lot.ends_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Badge className="bg-green-500 text-white border-none font-black px-4 py-1 rounded-full text-[10px] tracking-widest">
                    VENCEDOR
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mt-6 gap-4">
                  <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 w-full sm:w-auto">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Valor de Arremate</p>
                    <p className="font-black text-slate-900 text-xl">{formatCurrency(lot.final_price)}</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Link to={`/lots/${lot.id}`} className="flex-1 sm:flex-none">
                      <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold gap-2">
                        <ExternalLink size={16} /> Detalhes
                      </Button>
                    </Link>
                    <Button 
                      className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black px-8 shadow-lg shadow-orange-100"
                      onClick={() => navigate(`/app/checkout/${lot.id}`)}
                    >
                      PAGAR AGORA
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gavel className="text-slate-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum arremate ainda</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Participe dos leilões ativos para encontrar as melhores oportunidades.</p>
            <Link to="/auctions">
              <Button className="bg-slate-900 text-white rounded-xl px-8 font-bold">Explorar Leilões</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;