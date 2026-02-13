"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, Clock, Gavel, Info, ShieldCheck, 
  Calendar, Fuel, Gauge, MapPin, Share2, Heart,
  CheckCircle2, AlertTriangle, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const LotDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }

      const { data, error } = await supabase
        .from('lots')
        .select(`
          *,
          auctions (
            title,
            end_date
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        toast.error("Lote não encontrado");
        navigate('/app');
        return;
      }

      setLot(data);
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`lot-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lots', filter: `id=eq.${id}` }, (payload) => {
        setLot((prev: any) => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, navigate]);

  const handleBid = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para dar lances");
      return;
    }

    if (profile?.kyc_status !== 'approved') {
      toast.error("Sua conta precisa ser aprovada para dar lances");
      navigate('/verify');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= (lot.current_bid || lot.initial_bid)) {
      toast.error("O lance deve ser maior que o valor atual");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          lot_id: id,
          user_id: user.id,
          amount: amount
        });

      if (bidError) throw bidError;

      const { error: lotError } = await supabase
        .from('lots')
        .update({ current_bid: amount })
        .eq('id', id);

      if (lotError) throw lotError;

      toast.success("Lance realizado com sucesso!");
      setBidAmount('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Clock className="animate-spin text-orange-500" /></div>;

  // Consideramos finalizado se houver um winner_id definido
  const isFinished = !!lot.winner_id;
  const isWinner = user && lot.winner_id === user.id;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl gap-2">
            <ChevronLeft size={20} /> Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full"><Share2 size={20} /></Button>
            <Button variant="ghost" size="icon" className="rounded-full"><Heart size={20} /></Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video rounded-3xl overflow-hidden bg-slate-200 shadow-inner relative">
              <img src={lot.image_url} alt={lot.title} className="w-full h-full object-cover" />
              {isFinished && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white p-6 rounded-2xl text-center shadow-2xl transform -rotate-2">
                    <Lock className="mx-auto text-orange-500 mb-2" size={32} />
                    <h2 className="text-2xl font-black text-slate-900 uppercase">Leilão Encerrado</h2>
                    <p className="text-slate-500 font-medium">Este lote já foi contemplado</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2 bg-orange-100 text-orange-600 hover:bg-orange-100 border-none">Lote #{lot.id.substring(0, 5)}</Badge>
                  <h1 className="text-3xl font-black text-slate-900">{lot.title}</h1>
                  <p className="text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14} /> {lot.location || 'Pátio Central'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 font-medium">Lance Atual</p>
                  <p className="text-3xl font-black text-orange-600">{formatCurrency(lot.current_bid || lot.initial_bid)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Calendar size={20} /></div>
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Ano</p><p className="font-bold text-slate-700">{lot.year || '2022'}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Gauge size={20} /></div>
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">KM</p><p className="font-bold text-slate-700">{lot.km || '0'} km</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Fuel size={20} /></div>
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Combustível</p><p className="font-bold text-slate-700">{lot.fuel || 'Flex'}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><ShieldCheck size={20} /></div>
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Garantia</p><p className="font-bold text-slate-700">Sim</p></div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Descrição do Lote</h3>
                <p className="text-slate-600 leading-relaxed">{lot.description || 'Veículo em excelente estado de conservação, documentação em dia e pronto para transferência.'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {isFinished ? (
              <Card className={`border-none shadow-xl rounded-3xl overflow-hidden ${isWinner ? 'bg-green-600 text-white' : 'bg-slate-900 text-white'}`}>
                <CardContent className="p-8 text-center">
                  {isWinner ? (
                    <>
                      <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-2xl font-black mb-2">Você Venceu!</h3>
                      <p className="text-green-100 mb-6">Parabéns! Seu lance foi o vencedor. Nossa equipe entrará em contato em breve.</p>
                      <div className="bg-white/10 p-4 rounded-2xl">
                        <p className="text-xs uppercase font-bold opacity-70">Valor Final</p>
                        <p className="text-2xl font-black">{formatCurrency(lot.current_bid)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} className="text-orange-400" />
                      </div>
                      <h3 className="text-2xl font-black mb-2">Leilão Finalizado</h3>
                      <p className="text-slate-400 mb-6">Este veículo já foi arrematado e não aceita mais novos lances.</p>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl" onClick={() => navigate('/app')}>
                        Ver Outros Veículos
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <div className="bg-slate-900 p-6 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="text-orange-500" size={18} />
                    <span className="text-sm font-medium">Tempo Restante</span>
                  </div>
                  <p className="text-2xl font-black">2d 14h 35m</p>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase">Seu Lance</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                      <input 
                        type="number" 
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 focus:ring-0 transition-all font-black text-xl"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Mínimo aceitável: <span className="font-bold text-slate-600">{formatCurrency((lot.current_bid || lot.initial_bid) + 500)}</span></p>
                  </div>

                  <Button 
                    onClick={handleBid}
                    disabled={isSubmitting || !bidAmount}
                    className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-100 transition-all active:scale-95"
                  >
                    {isSubmitting ? <Clock className="animate-spin" /> : <><Gavel className="mr-2" size={20} /> DAR LANCE AGORA</>}
                  </Button>

                  <div className="p-4 bg-blue-50 rounded-2xl flex gap-3">
                    <Info className="text-blue-500 shrink-0" size={20} />
                    <p className="text-xs text-blue-700 leading-relaxed">Ao dar um lance, você concorda com os termos e condições do leilão. Lances são irrevogáveis.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-green-500" size={18} /> Compra Segura
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-xs text-slate-500">
                  <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                  Pagamento via PIX ou Transferência Bancária.
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-500">
                  <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                  Documentação entregue em até 15 dias úteis.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotDetails;