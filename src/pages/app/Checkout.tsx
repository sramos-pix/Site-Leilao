"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, ArrowLeft, 
  CheckCircle2, Loader2, Info, Copy, QrCode
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

  const copyPixCode = () => {
    navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136f2e3d4c5-b6a7-4890-9123-456789abcdef5204000053039865802BR5920AUTOBID LEILOES LTDA6009SAO PAULO62070503***6304ABCD");
    toast({ title: "Código Copiado!", description: "Cole no seu aplicativo do banco." });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      toast({
        title: "Pagamento em Análise",
        description: "Recebemos sua intenção de pagamento. A baixa ocorre em até 30 min.",
      });
      setIsProcessing(false);
      navigate('/app/history');
    }, 2000);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex items-center justify-center flex-1">
        <Loader2 className="animate-spin text-orange-500" />
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 gap-2 text-slate-500 font-bold hover:bg-white rounded-xl">
          <ArrowLeft size={18} /> VOLTAR AO HISTÓRICO
        </Button>

        <div className="grid grid-cols-1 gap-8">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-10">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-orange-500 text-white border-none mb-4 px-3 py-1 rounded-full font-black text-[10px] tracking-widest">PAGAMENTO PENDENTE</Badge>
                  <CardTitle className="text-3xl font-black flex items-center gap-3">
                    Finalizar Arremate
                  </CardTitle>
                  <p className="text-slate-400 mt-2 font-medium">{lot?.title} • Lote #{lot?.lot_number}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                  <ShieldCheck className="text-orange-500" size={40} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-10 space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 gap-6">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                  <p className="text-4xl font-black text-slate-900">{formatCurrency(lot?.final_price || lot?.current_bid)}</p>
                  <p className="text-xs text-green-600 font-bold mt-1 flex items-center justify-center md:justify-start gap-1">
                    <CheckCircle2 size={12} /> Taxas inclusas
                  </p>
                </div>
                <div className="h-px w-full md:h-12 md:w-px bg-slate-200" />
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimento</p>
                  <p className="text-xl font-bold text-red-500">Hoje, às 18:00</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-lg">Pagamento via PIX</h4>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Processamento Instantâneo</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border-4 border-white">
                      <QrCode size={180} className="text-slate-900" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Aponte a câmera do celular para o QR Code</p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 font-medium">Ou utilize o código Copia e Cola:</p>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 font-mono text-[10px] break-all text-slate-400 h-24 overflow-hidden relative">
                      00020126580014BR.GOV.BCB.PIX0136f2e3d4c5-b6a7-4890-9123-456789abcdef5204000053039865802BR5920AUTOBID LEILOES LTDA6009SAO PAULO62070503***6304ABCD
                      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 rounded-xl font-bold gap-2 border-slate-200 hover:bg-slate-100"
                      onClick={copyPixCode}
                    >
                      <Copy size={18} /> COPIAR CÓDIGO PIX
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  className="w-full h-16 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl text-lg font-black shadow-xl transition-all active:scale-[0.98]"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'JÁ REALIZEI O PAGAMENTO'}
                </Button>
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Pagamento 100% Seguro via Banco Central</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
            <Info className="text-blue-500 shrink-0" size={24} />
            <div className="space-y-1">
              <p className="text-sm font-bold text-blue-900">Informação Importante</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Após o pagamento, o comprovante é processado automaticamente. Você receberá um e-mail com o Termo de Arrematação e as instruções para retirada do veículo em nosso pátio.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;