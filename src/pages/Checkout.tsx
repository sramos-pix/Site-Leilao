"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Copy, QrCode, ShieldCheck, ArrowLeft, AlertCircle, RefreshCw, Info, Lock, ShieldAlert, CheckCircle } from 'lucide-react';
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
  const [buyerFee, setBuyerFee] = useState(5);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);

  useEffect(() => {
    const fetchLotAndSettings = async () => {
      if (!id) return;
      
      // Busca as configurações da plataforma
      const { data: settings } = await supabase.from('platform_settings').select('buyer_fee').eq('id', 1).single();
      if (settings?.buyer_fee) {
        setBuyerFee(Number(settings.buyer_fee));
      }

      const { data } = await supabase.from('lots').select('*, auctions(title)').eq('id', id).single();
      if (data) setLot(data);
      
      // Tenta recuperar pagamento salvo para este lote
      const savedPayment = localStorage.getItem(`pix_payment_${id}_${isCommission ? 'comm' : 'veh'}`);
      if (savedPayment) {
        const parsed = JSON.parse(savedPayment);
        // Só restaura se ainda não expirou
        if (parsed.expiresAtMs > Date.now()) {
          setPaymentData(parsed.data);
          setExpiresAtMs(parsed.expiresAtMs);
        } else {
          localStorage.removeItem(`pix_payment_${id}_${isCommission ? 'comm' : 'veh'}`);
        }
      }
      
      setLoading(false);
    };
    fetchLotAndSettings();
  }, [id, isCommission]);

  const handleGeneratePix = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      const amount = isCommission ? (lot.final_price || lot.current_bid) * (buyerFee / 100) : (lot.final_price || lot.current_bid);
      const description = isCommission 
        ? `Comissão Leiloeiro (${buyerFee}%) - Lote ${lot.lot_number}` 
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
        const expiry = Date.now() + 12 * 60 * 1000;
        setPaymentData(res);
        setExpiresAtMs(expiry);
        
        // Salva no localStorage para persistência
        localStorage.setItem(`pix_payment_${id}_${isCommission ? 'comm' : 'veh'}`, JSON.stringify({
          data: res,
          expiresAtMs: expiry
        }));

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

  const displayAmount = isCommission ? (lot.final_price || lot.current_bid) * (buyerFee / 100) : (lot.final_price || lot.current_bid);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl text-slate-500 font-bold hover:bg-white">
            <ArrowLeft size={20} className="mr-2" /> VOLTAR
          </Button>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <Lock size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">Ambiente Seguro</span>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <ShieldCheck className="text-orange-500" /> {isCommission ? `Pagamento de Comissão (${buyerFee}%)` : 'Pagamento do Veículo'}
              </CardTitle>
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Pix.png" alt="Pix" className="h-6 brightness-0 invert" />
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck size={80} className="text-orange-600" />
              </div>
              <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Valor a Pagar</p>
              <p className="text-3xl font-black text-orange-600">{formatCurrency(displayAmount)}</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">{lot?.title} • Lote #{lot?.lot_number}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <ShieldAlert size={18} className="text-slate-400 mb-1" />
                <span className="text-[9px] font-bold text-slate-500 leading-tight">Dados Criptografados</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <CheckCircle size={18} className="text-slate-400 mb-1" />
                <span className="text-[9px] font-bold text-slate-500 leading-tight">Liberação Imediata</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Lock size={18} className="text-slate-400 mb-1" />
                <span className="text-[9px] font-bold text-slate-500 leading-tight">Pagamento Protegido</span>
              </div>
            </div>

            {isCommission && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <Info className="text-blue-500 shrink-0" size={20} />
                <p className="text-xs text-blue-700 leading-relaxed">
                  A comissão de {buyerFee}% é obrigatória para a liberação da Nota de Arremate e agendamento da retirada do veículo.
                </p>
              </div>
            )}

            {!paymentData ? (
              <div className="space-y-4">
                <Button 
                  onClick={handleGeneratePix}
                  disabled={processing}
                  className="w-full h-16 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95"
                >
                  {processing ? <Loader2 className="animate-spin mr-2" /> : <QrCode className="mr-2" />}
                  GERAR PIX SEGURO
                </Button>
                <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                  <Lock size={10} /> Suas informações estão protegidas por criptografia de ponta a ponta.
                </p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl border-2 border-slate-100 relative">
                    <img src={paymentData.qr_code_url} alt="QR Code PIX" className="w-48 h-48" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <CheckCircle2 size={10} /> QR CODE ATIVO
                    </div>
                  </div>
                  {expiresAtMs && <PaymentCountdown expiresAtMs={expiresAtMs} onExpire={() => {
                    localStorage.removeItem(`pix_payment_${id}_${isCommission ? 'comm' : 'veh'}`);
                    setPaymentData(null);
                    setExpiresAtMs(null);
                    toast({ variant: "destructive", title: "PIX Expirado", description: "Gere um novo código para pagar." });
                  }} />}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pix Copia e Cola</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl text-[10px] font-mono break-all border border-slate-200 text-slate-500 max-h-24 overflow-y-auto">
                      {paymentData.pix_code}
                    </div>
                    <Button onClick={() => { navigator.clipboard.writeText(paymentData.pix_code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="bg-slate-900 h-auto px-6 rounded-xl hover:bg-orange-600 transition-colors">
                      {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button onClick={() => navigate('/app/wins')} className="w-full h-14 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-black shadow-lg shadow-emerald-100">
                    JÁ REALIZEI O PAGAMENTO
                  </Button>
                  <div className="flex items-center justify-center gap-4 opacity-50 grayscale">
                    <img src="https://logodownload.org/wp-content/uploads/2017/05/selo-google-safe-browsing.png" alt="Google Safe" className="h-6" />
                    <img src="https://logodownload.org/wp-content/uploads/2014/10/pci-dss-compliant-logo.png" alt="PCI" className="h-4" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <ShieldCheck className="text-orange-600" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Garantia de Arremate</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Seu pagamento é processado em ambiente seguro. Após a confirmação, seu veículo será liberado para retirada conforme as regras do edital.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;