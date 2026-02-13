"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, CreditCard, FileText, 
  MessageCircle, CheckCircle2, Clock, Loader2, ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [wins, setWins] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();

  const fetchWins = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
  }, []);

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Meus Arremates</h1>
        <p className="text-slate-500">Histórico de veículos vencidos e instruções de pagamento.</p>
      </div>

      {wins.length > 0 ? (
        <div className="grid gap-6">
          {wins.map((lot) => (
            <Card key={lot.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-72 h-48 bg-slate-100">
                  <img 
                    src={lot.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} 
                    className="w-full h-full object-cover" 
                    alt={lot.title} 
                  />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge className="bg-green-100 text-green-600 border-none mb-2">ARREMATADO</Badge>
                      <h3 className="text-xl font-bold text-slate-900">{lot.title}</h3>
                      <p className="text-sm text-slate-500">Finalizado em {formatDate(lot.updated_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Valor Final</p>
                      <p className="text-2xl font-black text-orange-600">{formatCurrency(lot.final_price || lot.current_bid)}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <FileText size={18} className="text-orange-500" /> Próximos Passos
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Parabéns pela conquista! Para garantir seu veículo, você deve efetuar o pagamento em até 24h úteis. 
                      Após a confirmação, nossa equipe entrará em contato para agendar a retirada e transferência de documentos.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 h-12 font-bold gap-2"
                      onClick={() => navigate(`/app/checkout/${lot.id}`)}
                    >
                      <CreditCard size={18} /> PAGAR AGORA
                    </Button>
                    <Button variant="outline" className="rounded-xl h-12 font-bold gap-2 border-slate-200">
                      <MessageCircle size={18} /> SUPORTE WHATSAPP
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <Trophy className="mx-auto text-slate-200 mb-4" size={64} />
          <h3 className="text-xl font-bold text-slate-900">Nenhum arremate ainda</h3>
          <p className="text-slate-500 mt-2">Continue participando dos leilões para ver suas vitórias aqui!</p>
          <Button 
            variant="link" 
            className="text-orange-500 font-bold mt-4"
            onClick={() => navigate('/')}
          >
            Explorar Leilões Ativos
          </Button>
        </div>
      )}
    </div>
  );
};

export default History;