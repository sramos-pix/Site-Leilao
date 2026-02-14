"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Copy, QrCode, ShieldCheck, ArrowLeft, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { generatePixPayment } from '@/services/connectPay';

const Checkout = () => {
  const { lotId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lot, setLot] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLotData = async () => {
      const { data, error } = await supabase
        .from('lots')
        .select('*, auctions(title)')
        .eq('id', lotId)
        .single();

      if (error || !data) {
        toast({ variant: "destructive", title: "Erro", description: "Lote não encontrado." });
        navigate('/app');
        return;
      }
      setLot(data);
      setLoading(false);
    };

    fetchLotData();
  }, [lotId, navigate, toast]);

  const handleGeneratePayment = async () => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      const res = await generatePixPayment({
        amount: lot.final_price || lot.current_bid,
        description: `Arremate: ${lot.title}`,
        customer: {
          name: profile?.full_name || '',
          document: profile?.document_id || '',
          email: profile?.email || ''
        }
      });

      setPaymentData(res);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro no Checkout", description: "Não foi possível gerar o pagamento." });
    } finally {
      setProcessing(false);
    }
  };

  const copyPix = () => {
    if (!paymentData?.pix_code) return;
    navigator.clipboard.writeText(paymentData.pix_code);
    setCopied(true);
    toast({ title: "Copiado!", description: "Código PIX copiado para a área de transferência." });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 text-slate-500 hover:text-slate-900 rounded-xl"
        >
          <ArrowLeft size={20} className="mr-2" /> Voltar
        </Button>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Finalizar Pagamento</CardTitle>
                <p className="text-slate-400 mt-1">{lot.auctions?.title}</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Veículo Arrematado</label>
                  <h3 className="text-xl font-bold text-slate-900">{lot.title}</h3>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500">Valor do Arremate</span>
                    <span className="font-bold text-slate-900">{formatCurrency(lot.final_price || lot.current_bid)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-900">Total a Pagar</span>
                    <span className="text-2xl font-black text-orange-600">{formatCurrency(lot.final_price || lot.current_bid)}</span>
                  </div>
                </div>

                {!paymentData ? (
                  <Button 
                    onClick={handleGeneratePayment}
                    disabled={processing}
                    className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200"
                  >
                    {processing ? <Loader2 className="animate-spin mr-2" /> : <QrCode className="mr-2" />}
                    GERAR PIX DE PAGAMENTO
                  </Button>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700">
                      <CheckCircle2 size={20} />
                      <span className="text-sm font-medium">PIX Gerado com sucesso!</span>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Código Copia e Cola</label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-100 p-3 rounded-xl text-[10px] font-mono break-all border border-slate-200 text-slate-600">
                          {paymentData.pix_code}
                        </div>
                        <Button 
                          onClick={copyPix}
                          className="h-auto bg-slate-900 hover:bg-slate-800 rounded-xl px-4"
                        >
                          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {paymentData && (
                <div className="w-full md:w-48 flex flex-col items-center justify-center space-y-4">
                  <div className="bg-white p-4 rounded-3xl shadow-inner border border-slate-100">
                    <img src={paymentData.qr_code_url} alt="QR Code PIX" className="w-40 h-40" />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center font-medium uppercase tracking-widest">
                    Escaneie para pagar
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-6 opacity-50">
              <div className="flex items-center gap-2 grayscale">
                <CreditCard size={16} />
                <span className="text-xs font-bold">ConnectPay Secure</span>
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <span className="text-xs font-bold">Ambiente Criptografado</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;