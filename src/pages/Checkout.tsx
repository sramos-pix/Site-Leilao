"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, ShieldCheck, ArrowLeft, 
  CheckCircle2, Loader2, Info
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lot, setLot] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    const fetchLot = async () => {
      const { data } = await supabase.from('lots').select('*').eq('id', id).single();
      setLot(data);
      setIsLoading(false);
    };
    fetchLot();
  }, [id]);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulação de processamento
    setTimeout(async () => {
      toast({
        title: "Pagamento Recebido!",
        description: "Estamos processando a baixa do seu veículo.",
      });
      setIsProcessing(false);
      navigate('/app/history');
    }, 2000);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2 text-slate-500">
        <ArrowLeft size={18} /> Voltar
      </Button>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-8">
          <CardTitle className="text-2xl font-black flex items-center gap-3">
            <CreditCard className="text-orange-500" /> Finalizar Pagamento
          </CardTitle>
          <p className="text-slate-400 text-sm">Lote: {lot?.title}</p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase">Total a Pagar</p>
              <p className="text-3xl font-black text-slate-900">{formatCurrency(lot?.final_price || lot?.current_bid)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-2xl">
              <ShieldCheck className="text-orange-600" size={32} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Método de Pagamento</h4>
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center justify-between p-5 rounded-2xl border-2 border-orange-500 bg-orange-50/50 text-left">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm"><CreditCard className="text-orange-500" /></div>
                  <div>
                    <p className="font-bold text-slate-900">PIX (Recomendado)</p>
                    <p className="text-xs text-slate-500">Liberação imediata do veículo</p>
                  </div>
                </div>
                <CheckCircle2 className="text-orange-500" />
              </button>
              <button disabled className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-slate-50 opacity-50 text-left cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm"><Info className="text-slate-400" /></div>
                  <div>
                    <p className="font-bold text-slate-400">Boleto Bancário</p>
                    <p className="text-xs text-slate-400">Até 3 dias para compensar</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <Button 
            className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-black shadow-xl"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : 'GERAR PIX DE PAGAMENTO'}
          </Button>

          <p className="text-center text-xs text-slate-400">
            Ambiente seguro e criptografado. Ao pagar você concorda com os termos do leilão.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;