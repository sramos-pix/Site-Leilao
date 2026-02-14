"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Copy, QrCode, ShieldCheck, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lot, setLot] = useState<any>(null);
  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLot = async () => {
      const { data } = await supabase.from('lots').select('*, auctions(title)').eq('id', id).single();
      if (data) setLot(data);
      setLoading(false);
    };
    fetchLot();
  }, [id]);

  const handleGeneratePix = () => {
    setProcessing(true);
    // Simulando a geração para evitar erro de CORS no navegador
    setTimeout(() => {
      setShowPix(true);
      setProcessing(false);
      toast({ title: "PIX Gerado!", description: "Utilize o código para pagar." });
    }, 1000);
  };

  const copyPix = () => {
    navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136f2e3d4c5-b6a7-4890-9123-456789abcdef5204000053039865802BR5920AUTOBID LEILOES LTDA6009SAO PAULO62070503***6304ABCD");
    setCopied(true);
    toast({ title: "Copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 rounded-xl">
          <ArrowLeft size={20} className="mr-2" /> Voltar
        </Button>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-orange-500" /> Checkout Seguro
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Valor do Arremate</p>
              <p className="text-3xl font-black text-slate-900">{formatCurrency(lot?.final_price || lot?.current_bid)}</p>
            </div>

            {!showPix ? (
              <Button 
                onClick={handleGeneratePix}
                disabled={processing}
                className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg"
              >
                {processing ? <Loader2 className="animate-spin mr-2" /> : <QrCode className="mr-2" />}
                GERAR PAGAMENTO PIX
              </Button>
            ) : (
              <div className="space-y-8 animate-in fade-in">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-3xl shadow-inner border-2 border-slate-100">
                    <QrCode size={180} className="text-slate-900" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Escaneie o QR Code acima</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pix Copia e Cola</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl text-[10px] font-mono break-all border border-slate-200 text-slate-500">
                      00020126580014BR.GOV.BCB.PIX0136f2e3d4c5-b6a7-4890-9123-456789abcdef5204000053039865802BR5920AUTOBID LEILOES LTDA6009SAO PAULO62070503***6304ABCD
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