"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Gavel, ChevronRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';

const History = () => {
  const [wins, setWins] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();

  const fetchWins = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Busca lotes onde o status é 'finished' e o usuário logado é o vencedor
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .eq('winner_id', user.id)
        .eq('status', 'finished')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWins(data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWins();
    
    // Realtime para atualizar assim que o admin contemplar
    const channel = supabase
      .channel('history-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lots' }, () => fetchWins())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meus Arremates</h1>
          <p className="text-slate-500">Veículos contemplados e prontos para finalização.</p>
        </div>
      </div>

      <div className="space-y-4">
        {wins.length > 0 ? wins.map((lot) => (
          <Card key={lot.id} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-0 flex flex-col sm:flex-row">
              {/* Imagem à esquerda (Padrão Dashboard) */}
              <div className="w-full sm:w-48 h-32 bg-slate-200 shrink-0">
                <img 
                  src={lot.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} 
                  className="w-full h-full object-cover" 
                  alt={lot.title} 
                />
              </div>
              
              {/* Conteúdo à direita */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{lot.title}</h3>
                    <p className="text-xs text-slate-500">Lote #{lot.lot_number || lot.id.substring(0, 5)}</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-600 border-none font-bold">
                    Arrematado
                  </Badge>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Valor de Arremate</p>
                    <p className="font-bold text-slate-900 text-lg">{formatCurrency(lot.final_price || lot.current_bid)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-6"
                      onClick={() => navigate(`/app/checkout/${lot.id}`)}
                    >
                      Pagar Agora
                    </Button>
                    <Link to={`/lots/${lot.id}`}>
                      <Button size="sm" variant="outline" className="rounded-xl border-slate-200">
                        Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <Gavel className="mx-auto text-slate-200 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum arremate ainda</h3>
            <p className="text-slate-500 mb-8">Seus veículos contemplados aparecerão aqui após a aprovação do leiloeiro.</p>
            <Link to="/auctions">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-6 font-bold">
                Explorar Leilões Ativos
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;