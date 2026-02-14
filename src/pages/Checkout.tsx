"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Copy, QrCode, ShieldCheck, ArrowLeft, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { generatePixPayment } from '@/services/connectPay';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lot, setLot] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLotData = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('lots')
        .select('*, auctions(title)')
        .eq('id', id)
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
  }, [id, navigate, toast]);

  const handleGeneratePayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single();

      if (!profile?.document_id) {
        setError("Seu CPF não está cadastrado no perfil. Por favor, atualize seu cadastro.");
        setProcessing(false);
        return;
      }

      const res = await generatePixPayment({
        amount: lot.final_price || lot.current_bid,
        description: `Arremate: ${lot.title}`,
        customer: {
          name: profile.full_name || '',
          document: profile.document_id,
          email: profile.email || '',
          phone: profile.phone || '11999999999'
        }
      });

      if (res.success) {
        setPaymentData(res);
        toast({ title: "PIX Gerado!" });
      } else {
        setError(res.error);
        console.error("Erro detalhado:", res.details);
      }
    } catch (err: any) {
      setError("Erro inesperado ao processar pagamento.");
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!paymentData?.pix_code) return;
    navigator.clipboard.writeText(paymentData.pix_code);
    setCopied(true);
    toast({ title: "Copiado!", description: "Código PIX copiado para a área de transferência." });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-slate-500 rounded-xl">
          <ArrowLeft size={20} className="mr-2" /> Voltar
        </Button>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Finalizar Pagamento</CardTitle>
                <p className="text-slate-400 mt-1">{lot.auctions?.title}</p>
              </div>
              <ShieldCheck className="text-orange-500" size={32} />
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total a Pagar</p>
                <p className="text-3xl font-black text-orange-600">{formatCurrency(lot.final_price || lot.current_bid)}</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700">
                  <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                  <div className="text-sm">
                    <p className="font-bold">Erro na Integração:</p>
                    <p className="opacity-80">{error}</p>
                  </div>
                </div>
              )}

              {!paymentData ? (
                <Button 
                  onClick={handleGeneratePayment}
                  disabled={processing}
                  className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg"
                >
                  {processing ? <Loader2 className="animate-spin mr-2" /> : <QrCode className="mr-2" />}
                  GERAR PIX AGORA
                </Button>
              ) : (
                <div className="flex flex-col md:flex-row gap-8 items-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700">
                      <CheckCircle2 size={20} />
                      <span className="text-sm font-bold">PIX Gerado com Sucesso!</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Código Copia e Cola</label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-100 p-3 rounded-xl text-[10px] font-mono break-all border border-slate-200 text-slate-600 max-h-24 overflow-y-auto">
                          {paymentData.pix_code}
                        </div>
                        <Button onClick={copyToClipboard} className="bg-slate-900 h-auto px-4 rounded-xl">
                          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="bg-white p-3 rounded-2xl shadow-inner border border-slate-100">
                      <img src={paymentData.qr_code_url} alt="QR Code" className="w-40 h-40" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Escaneie para pagar</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;