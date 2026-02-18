"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Copy, QrCode, ShieldCheck, ArrowLeft, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { generatePixPayment } from '@/services/connectPay';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentCountdown from '@/components/PaymentCountdown';

const Checkout = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isCommission = searchParams.get('type') === 'commission';
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lot, setLot] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);

  useEffect(() => {
    const fetchLot = async () => {
      if (!id) return;
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
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      const amount = isCommission ? (lot.final_price || lot.current_bid) * 0.05 : (lot.final_price || lot.current_bid);
      const description = isCommission 
        ? `Comissão Leiloeiro (5%) - Lote ${lot.lot_number}` 
        : `Pagamento Veículo - Lote ${lot.lot_number}`;

      const res = await generatePixPayment({
        amount,
        description,
        customer: {
          name: profile?.full_name || user.email?.split('@')[0] || "",
          document: String(profile?.document_id || "").replace(/\D/g, ""),
          email: profile?.email || user.email || "",
          phone: String(profile?.phone || "").replace(/\D/g, "")
        }
      });

      if (res.success) {
        setPaymentData(res);
        setExpiresAtMs(Date.now() + 12 * 60 * 1000);
        toast({ title: "PIX Gerado!", description: "Aguardando pagamento." });
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  const displayAmount = isCommission ? (lot.final_price || lot.current_bid) * 0.05 : (lot.final_price || lot.current_bid);

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
              <ShieldCheck className="text-orange-500" /> {isCommission ? 'Pagamento de Comissão' : 'Pagamento do Veículo'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Valor a Pagar</p>
              <p className="text-3xl font-black text-orange-600">{formatCurrency(displayAmount)}</p>
              <p className="text-xs text-slate-500 mt-2">{lot?.title} • Lote #{lot?.lot_number}</p>
            </div>

            {isCommission && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <Info className="text-blue-500 shrink-0" size={20} />
                <p className="text-xs text-blue-700 leading-relaxed">
                  A comissão de 5% é obrigatória para a liberação da Nota de Arremate e agendamento da retirada do veículo.
                </p>
              </div>
            )}

            {!paymentData ? (
              <Button 
                onClick={handleGeneratePix}
                disabled={processing}
                className="w-full h-16 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg"
              >
                {processing ? <Loader2 className="animate-spin mr-2" /> : <QrCode className="mr-2" />}
                GERAR PIX AGORA
              </Button>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-3xl shadow-inner border-2 border-slate-100">
                    <img src={paymentData.qr_code_url} alt="QR Code PIX" className="w-48 h-48" />
                  </div>
                  {expiresAtMs && <PaymentCountdown expiresAtMs={expiresAtMs} />}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pix Copia e Cola</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl text-[10px] font-mono break-all border border-slate-200 text-slate-500 max-h-24 overflow-y-auto">
                      {paymentData.pix_code}
                    </div>
                    <Button onClick={() => { navigator.clipboard.writeText(paymentData.pix_code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="bg-slate-900 h-auto px-6 rounded-xl">
                      {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    </Button>
                  </div>
                </div>

                <Button onClick={() => navigate('/app/wins')} className="w-full h-12 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-black">
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