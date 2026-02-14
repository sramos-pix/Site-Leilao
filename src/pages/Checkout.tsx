"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Copy, QrCode, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { generatePixPayment } from '@/services/connectPay';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
    const fetchLot = async () => {
      const { data } = await supabase.from('lots').select('*, auctions(title)').eq('id', id).single();
      if (data) setLot(data);
      setLoading(false);
    };
    fetchLot();
  }, [id]);

  const handleGeneratePix = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single();

      const res = await generatePixPayment({
        amount: lot.final_price || lot.current_bid,
        description: `Arremate Lote ${lot.lot_number}: ${lot.title}`,
        customer: {
          name: profile?.full_name || 'Cliente AutoBid',
          document: profile?.document_id || '',
          email: profile?.email || '',
          phone: profile?.phone
        }
      });

      if (res.success) {
        setPaymentData(res);
        toast({ title: "PIX Gerado com Sucesso!" });
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError("Não foi possível conectar com a intermediadora.");
    } finally {
      setProcessing(false);
    }
  };

  const copyPix = () => {
    if (!paymentData?.pix_code) return;
    navigator.clipboard.writeText(paymentData.pix_code);
    setCopied(true);
    toast({ title: "Código Copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 rounded-xl text-slate-500 font-bold">
          <ArrowLeft size={20} className="mr-2" /> VOLTAR
        </Button>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-orange-500" /> Checkout ConnectPay
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Valor Total</p>
              <p className="text-3xl font-black text-slate-900">{formatCurrency(lot?.final_price || lot?.current_bid)}</p>
              <p className="text-xs text-slate-500 mt-2">{lot?.title}</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-bold">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {!paymentData ? (
              <Button 
                onClick={handleGeneratePix}
                disabled={processing}
                className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg"
              >
                {processing ? <Loader2 className="animate-spin mr-2" /> : <QrCode className="mr-2" />}
                GERAR PIX REAL (CONNECTPAY)
              </Button>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-3xl shadow-inner border-2 border-slate-100">
                    <img src={paymentData.qr_code_url} alt="QR Code PIX" className="w-48 h-48" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Escaneie o QR Code para pagar</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pix Copia e Cola</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl text-[10px] font-mono break-all border border-slate-200 text-slate-500 max-h-24 overflow-y-auto">
                      {paymentData.pix_code}
                    </div>
                    <Button onClick={copyPix} className="bg-slate-900 h-auto px-6 rounded-xl">
                      {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/app/history')}
                  className="w-full h-14 bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-xl font-bold"
                >
                  JÁ REALIZEI O PAGAMENTO
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;