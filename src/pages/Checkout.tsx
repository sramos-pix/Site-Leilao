"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Copy, QrCode, ShieldCheck, ArrowLeft, AlertTriangle, Bug } from 'lucide-react';
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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLotData = async () => {
      if (!id) return;
      const { data } = await supabase.from('lots').select('*, auctions(title)').eq('id', id).single();
      if (!data) { navigate('/app'); return; }
      setLot(data);
      setLoading(false);
    };
    fetchLotData();
  }, [id, navigate]);

  const handleGeneratePayment = async () => {
    setProcessing(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single();

      const res = await generatePixPayment({
        amount: lot.final_price || lot.current_bid,
        description: `Arremate: ${lot.title}`,
        customer: {
          name: profile?.full_name || 'Cliente',
          document: profile?.document_id || '',
          email: profile?.email || '',
          phone: profile?.phone || '11999999999'
        }
      });

      if (res.success) {
        setPaymentData(res);
        toast({ title: "PIX Gerado!" });
      } else {
        setError(res.error);
        setDebugInfo(res.raw);
      }
    } catch (err: any) {
      setError("Erro ao processar.");
      setDebugInfo(err.message);
    } finally {
      setProcessing(false);
    }
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
            <CardTitle className="text-2xl font-bold">Pagamento PIX</CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total</p>
              <p className="text-3xl font-black text-orange-600">{formatCurrency(lot.final_price || lot.current_bid)}</p>
            </div>

            {error && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700">
                  <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                  <div className="text-sm">
                    <p className="font-bold">{error}</p>
                  </div>
                </div>
                {debugInfo && (
                  <div className="p-4 bg-slate-900 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 text-orange-500 mb-2 text-xs font-bold">
                      <Bug size={14} /> RESPOSTA DA API:
                    </div>
                    <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap break-all">
                      {debugInfo}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {!paymentData ? (
              <Button 
                onClick={handleGeneratePayment}
                disabled={processing}
                className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg"
              >
                {processing ? <Loader2 className="animate-spin mr-2" /> : "GERAR PIX"}
              </Button>
            ) : (
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4 w-full">
                  <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-bold">PIX Gerado!</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 bg-slate-100 p-3 rounded-xl text-[10px] font-mono break-all border border-slate-200 text-slate-600">
                        {paymentData.pix_code}
                      </div>
                      <Button onClick={() => { navigator.clipboard.writeText(paymentData.pix_code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="bg-slate-900 h-auto px-4 rounded-xl">
                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <img src={paymentData.qr_code_url} alt="QR Code" className="w-40 h-40 border-4 border-white rounded-2xl shadow-sm" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;