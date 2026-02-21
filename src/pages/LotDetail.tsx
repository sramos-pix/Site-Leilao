"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Clock, Gavel, Gauge, Calendar, 
  Settings2, Fuel, Loader2, History, Info, ShieldCheck, TrendingUp, FileText, MapPin, CheckCircle2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, cn, maskEmail } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import CountdownTimer from '@/components/CountdownTimer';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Função para gerar números pseudo-aleatórios baseados em uma string (seed)
const mulberry32 = (a: number) => {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const LotDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [lot, setLot] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [activePhoto, setActivePhoto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [displayBids, setDisplayBids] = useState<any[]>([]);
  
  const isFinished = lot?.status === 'finished';

  const currentPrice = useMemo(() => {
    if (!lot) return 0;
    return Math.max(Number(lot.current_bid) || 0, Number(lot.start_bid) || 0);
  }, [lot]);

  // Gerenciamento de sessão robusto e independente
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setCurrentUser(session?.user || null);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setCurrentUser(session?.user || null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchLotData = useCallback(async () => {
    try {
      const { data: lotData } = await supabase
        .from('lots')
        .select('*, auctions(title)')
        .eq('id', id)
        .single();

      if (!lotData) return;
      setLot(lotData);
      
      // 1. Busca apenas os lances reais (sem JOIN para evitar falhas silenciosas)
      const { data: realBids } = await supabase
        .from('bids')
        .select('id, amount, user_id, created_at')
        .eq('lot_id', id)
        .order('amount', { ascending: false });
      
      // 2. Busca os e-mails dos usuários que deram lance separadamente
      const userIds = [...new Set((realBids || []).map(b => b.user_id))];
      let profilesMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);
          
        profilesMap = (profilesData || []).reduce((acc: any, p) => {
          acc[p.id] = p.email;
          return acc;
        }, {});
      }

      const increment = lotData.bid_increment || 500;
      const currentVal = lotData.current_bid || lotData.start_bid || 0;

      // 3. Formata os lances reais mesclando com os e-mails encontrados
      const formattedReals = (realBids || []).map(b => ({
        id: b.id,
        amount: b.amount,
        created_at: b.created_at,
        email: profilesMap[b.user_id] || 'usuario@leilao.com',
        user_id: b.user_id,
        is_fake: false
      }));

      let finalBids = [...formattedReals];
      
      // 4. Geração Determinística de Lances Fictícios (Não muda no F5)
      if (finalBids.length < 10) {
        const needed = 10 - finalBids.length;
        let nextFakeAmount = finalBids.length > 0 
          ? finalBids[finalBids.length - 1].amount - increment
          : currentVal;

        const fakeEmails = ["m***@gmail.com", "a***@uol.com.br", "r***@hotmail.com", "c***@outlook.com", "j***@yahoo.com", "p***@icloud.com", "f***@bol.com.br"];
        
        const seed = id ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 123;
        const random = mulberry32(seed);
        const baseDate = lotData.created_at ? new Date(lotData.created_at).getTime() : Date.now() - (7 * 24 * 60 * 60 * 1000);

        for (let i = 0; i < needed; i++) {
          if (nextFakeAmount <= 0) break;
          
          const timeOffset = Math.floor(random() * 48 * 60 * 60 * 1000);
          const fakeDate = new Date(baseDate + timeOffset + (i * 3600000));
          
          finalBids.push({
            id: `fake-${i}-${id}`,
            amount: nextFakeAmount,
            created_at: fakeDate.toISOString(),
            email: fakeEmails[Math.floor(random() * fakeEmails.length)],
            user_id: 'system-fake',
            is_fake: true
          });

          nextFakeAmount -= increment;
        }
      }

      finalBids.sort((a, b) => b.amount - a.amount);
      setDisplayBids(finalBids);
      
      setBidAmount(prev => {
        const nextMin = currentVal + increment;
        return prev < nextMin ? nextMin : prev;
      });
      
      const { data: ph } = await supabase.from('lot_photos').select('*').eq('lot_id', id);
      setPhotos(ph || []);
      setActivePhoto(prev => prev || lotData.cover_image_url);
      
    } catch (e) {
      console.error("Erro ao buscar dados:", e);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLotData();
    
    const channel = supabase.channel(`lot-realtime-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids', filter: `lot_id=eq.${id}` }, fetchLotData)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lots', filter: `id=eq.${id}` }, fetchLotData)
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [id, fetchLotData]);

  const handleBid = async () => {
    if (!currentUser) {
      toast({ title: "Login necessário", description: "Faça login para dar lances.", variant: "destructive" });
      return;
    }

    const increment = lot.bid_increment || 500;
    const minBid = currentPrice + increment;
    const bidValue = Number(bidAmount);

    if (bidValue < minBid) {
      toast({ title: "Lance inválido", description: `Mínimo: ${formatCurrency(minBid)}`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Atualiza a UI otimisticamente
      setLot(prev => ({ ...prev, current_bid: bidValue }));
      
      const optimisticBid = {
        id: `temp-${Date.now()}`,
        amount: bidValue,
        created_at: new Date().toISOString(),
        email: currentUser.email,
        user_id: currentUser.id,
        is_fake: false
      };

      setDisplayBids(prev => {
        const newBids = [optimisticBid, ...prev];
        return newBids.sort((a, b) => b.amount - a.amount).slice(0, Math.max(10, newBids.length));
      });

      setBidAmount(bidValue + increment);

      // 1. Insere o lance na tabela bids
      const { error: bidError } = await supabase.from('bids').insert({
        lot_id: lot.id,
        user_id: currentUser.id,
        amount: bidValue
      });

      if (bidError) throw new Error("Erro ao registrar lance no histórico.");

      // 2. Atualiza o valor atual do lote
      const { error: lotError } = await supabase.from('lots').update({
        current_bid: bidValue
      }).eq('id', lot.id);

      if (lotError) throw new Error("Erro ao atualizar o valor do lote.");

      toast({ title: "Lance registrado com sucesso!" });
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      fetchLotData(); // Reverte a UI em caso de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !lot) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Coluna Esquerda: Fotos e Detalhes */}
          <div className="lg:col-span-8 space-y-6">
            <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-white relative border shadow-sm">
              <img src={activePhoto} className="w-full h-full object-cover" alt={lot.title} />
              {!isFinished && (
                <div className="absolute top-6 left-6 flex gap-3">
                  <Badge className="bg-slate-900/90 backdrop-blur-md text-white border-none px-4 py-1.5 rounded-full font-bold text-xs">LOTE #{lot.lot_number}</Badge>
                  <Badge className="bg-red-500 text-white border-none px-4 py-1.5 rounded-full font-black flex items-center gap-2 shadow-lg shadow-red-500/30">
                    <Clock size={14} className="animate-pulse" /> 
                    <CountdownTimer endsAt={lot.ends_at} lotId={lot.id} />
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {[lot.cover_image_url, ...photos.map(p => p.public_url)].filter(Boolean).map((url, i) => (
                <button key={i} onClick={() => setActivePhoto(url)} className={cn("shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all", activePhoto === url ? 'border-orange-500 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100')}>
                  <img src={url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>

            {/* Sinais de Confiança (Trust Signals) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600"><ShieldCheck size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-emerald-800">Laudo Cautelar</p>
                  <p className="text-[10px] text-emerald-600 font-medium">100% Aprovado</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600"><FileText size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-blue-800">Edital do Leilão</p>
                  <p className="text-[10px] text-blue-600 font-medium">Clique para ler</p>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-600"><MapPin size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-orange-800">Visitação Liberada</p>
                  <p className="text-[10px] text-orange-600 font-medium">Pátio São Paulo - SP</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{lot.title}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><Gauge size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">Quilometragem</p><p className="text-sm font-bold text-slate-700">{lot.mileage_km?.toLocaleString()} km</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><Calendar size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">Ano/Modelo</p><p className="text-sm font-bold text-slate-700">{lot.year}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><Settings2 size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">Câmbio</p><p className="text-sm font-bold text-slate-700">{lot.transmission || 'Automático'}</p></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><Fuel size={18} className="text-orange-500 mb-2" /><p className="text-[10px] font-bold text-slate-400 uppercase">Combustível</p><p className="text-sm font-bold text-slate-700">{lot.fuel_type || 'Flex'}</p></div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Info size={20} className="text-orange-500" /> Informações Adicionais</h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{lot.description || "Veículo em excelente estado de conservação, periciado e com documentação garantida pela AutoBid. Agende sua visita ao pátio para conferir pessoalmente."}</div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Lances */}
          <div className="lg:col-span-4 space-y-6">
            <Card className={cn("border-none shadow-2xl rounded-[2.5rem] overflow-hidden text-white", isFinished ? "bg-slate-800" : "bg-slate-900")}>
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <Badge className={cn("text-white border-none px-3 py-1 rounded-full text-[10px] font-bold", isFinished ? "bg-white/20" : "bg-orange-500")}>{isFinished ? "LEILÃO ENCERRADO" : "LEILÃO AO VIVO"}</Badge>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <ShieldCheck size={12} className="text-emerald-400" /> AUDITADO
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Lance Atual</p>
                  <p className="text-4xl font-black text-white">{formatCurrency(currentPrice)}</p>
                  
                  {!isFinished && (
                    <div className="flex items-center gap-1.5 text-orange-400 font-bold text-[11px] mt-1">
                      <TrendingUp size={12} />
                      <span>Incremento Mínimo: {formatCurrency(lot.bid_increment || 500)}</span>
                    </div>
                  )}
                </div>
                {!isFinished && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-white/40 uppercase ml-1">Valor do seu lance</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">R$</span>
                        <Input 
                          type="number" 
                          value={bidAmount} 
                          onChange={(e) => setBidAmount(Number(e.target.value))} 
                          className="w-full bg-white/5 border-white/10 text-white text-xl font-bold h-14 pl-12 rounded-2xl focus:ring-orange-500 transition-all" 
                        />
                      </div>
                    </div>
                    <Button onClick={handleBid} disabled={isSubmitting} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95 text-lg">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "CONFIRMAR LANCE"}
                    </Button>
                    <p className="text-[10px] text-center text-white/40">Ao dar um lance, você concorda com os termos do edital.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><History size={16} className="text-orange-500" /> Histórico de Lances</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{displayBids.length} lances</span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {displayBids.map((bid, idx) => {
                  // Verificação robusta para garantir que o lance do usuário seja sempre destacado
                  const isMyBid = currentUser && bid.user_id && (bid.user_id === currentUser.id);
                  const displayName = isMyBid ? "SEU LANCE" : (bid.is_fake ? bid.email : maskEmail(bid.email));
                  
                  return (
                    <div key={bid.id} className={cn(
                      "flex items-center justify-between text-sm p-3 rounded-xl transition-all",
                      isMyBid ? "bg-orange-50 border border-orange-100" : "bg-slate-50 hover:bg-slate-100"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", idx === 0 && !isFinished ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                        <div className="flex flex-col">
                          <span className={cn("font-bold text-[11px]", isMyBid ? "text-orange-700" : "text-slate-700")}>
                            {displayName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {new Date(bid.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={cn("font-black", isMyBid ? "text-orange-600" : "text-slate-900")}>{formatCurrency(bid.amount)}</span>
                        {idx === 0 && !isFinished && <span className="text-[9px] font-bold text-emerald-600 uppercase">Vencendo</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LotDetail;