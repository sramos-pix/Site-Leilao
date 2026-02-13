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

      // Busca lotes onde o usuário logado é o vencedor
      // Removemos a trava estrita de status 'finished' caso o admin tenha contemplado mas o status ainda não tenha virado
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .eq('winner_id', user.id)
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Meus Arremates</h1>
          <p className="text-slate-500">Histórico de veículos vencidos e instruções de pagamento.</p>
        </div>
        <Badge className="bg-orange-500 text-white border-none px-6 py-3 rounded-2xl font-black text-lg shadow-lg shadow-orange-100">
          {wins.length} {wins.length === 1 ? 'Veículo Arrematado' : 'Veículos Arrematados'}
        </Badge>
      </div>

      {wins.length > 0 ? (
        <div className="grid gap-6">
          {wins.map((lot) => (
            <Card key={lot.id} className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-xl transition-all duration-500">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-80 h-56 bg-slate-100 overflow-hidden">
                  <img 
                    src={lot.cover_image_url || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={lot.title} 
                  />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <Badge className="bg-green-500 text-white border-none mb-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        VITÓRIA CONFIRMADA
                      </Badge>
                      <h3 className="text-2xl font-black text-slate-900">{lot.title}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={14} /> Arrematado em {formatDate(lot.updated_at || lot.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Final</p>
                      <p className="text-3xl font-black text-orange-600">{formatCurrency(lot.final_price || lot.current_bid)}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <FileText size={80} />
                    </div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <CheckCircle2 size={18} className="text-green-500" /> Próximos Passos
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                      Parabéns! Você venceu a disputa. Para garantir a posse do veículo, o pagamento deve ser efetuado em até 24h. 
                      Após o pagamento, nossa equipe de pós-venda entrará em contato para agendar a retirada.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button 
                      className="bg-slate-900 hover:bg-orange-600 text-white rounded-2xl px-10 h-14 font-black gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
                      onClick={() => navigate(`/app/checkout/${lot.id}`)}
                    >
                      <CreditCard size={20} /> IR PARA PAGAMENTO
                    </Button>
                    <Button variant="outline" className="rounded-2xl h-14 px-8 font-bold gap-2 border-slate-200 hover:bg-slate-50">
                      <MessageCircle size={20} className="text-green-500" /> SUPORTE PÓS-VENDA
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="text-slate-200" size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Nenhum arremate ainda</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Suas vitórias aparecerão aqui assim que o administrador contemplar seus lances vencedores.
          </p>
          <Button 
            variant="link" 
            className="text-orange-500 font-black mt-6 text-lg"
            onClick={() => navigate('/auctions')}
          >
            Explorar Leilões Ativos <ExternalLink size={18} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default History;