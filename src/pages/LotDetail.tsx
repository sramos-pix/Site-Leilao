import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, Clock, Gavel, 
  ShieldCheck, Info, MapPin, Calendar, Gauge, 
  Fuel, Settings2, Palette, History, AlertTriangle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate, maskEmail } from '@/lib/utils';
import { placeBid } from '@/lib/actions';
import { useToast } from '@/components/ui/use-toast';

// Mock data (Em produção viria do Supabase)
const MOCK_LOT = {
  id: 'l1',
  auction_id: '1',
  lot_number: 1,
  title: 'BMW 320i M Sport 2022',
  current_bid: 215000,
  start_bid: 180000,
  ends_at: new Date(Date.now() + 3600000 * 2).toISOString(),
  images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200'],
  bids: []
};

const LotDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const lot = MOCK_LOT;

  // Cálculo dinâmico do incremento para a UI
  const getIncrement = (val: number) => {
    if (val < 20000) return 200;
    if (val < 50000) return 500;
    if (val < 100000) return 1000;
    return 2000;
  };

  const minIncrement = getIncrement(lot.current_bid);
  const [bidAmount, setBidAmount] = React.useState(lot.current_bid + minIncrement);

  const handleBid = async () => {
    setIsSubmitting(true);
    try {
      await placeBid(lot.id, bidAmount);
      toast({ title: "Lance efetuado!", description: "Seu lance foi registrado com sucesso." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao dar lance", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
             <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-lg mb-8">
                <img src={lot.images[0]} alt={lot.title} className="w-full h-full object-cover" />
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h1 className="text-3xl font-bold mb-4">{lot.title}</h1>
                <p className="text-slate-600">Veículo em excelente estado, revisado e com garantia de procedência.</p>
              </div>
          </div>

          <div className="lg:col-span-4">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden sticky top-24">
              <div className="bg-slate-900 p-6 text-white text-center">
                <div className="flex items-center justify-center gap-2 text-orange-500 mb-2">
                  <Clock size={18} className="animate-pulse" />
                  <span className="text-sm font-bold uppercase">Tempo Restante</span>
                </div>
                <div className="text-3xl font-mono font-bold">01:42:15</div>
              </div>
              
              <CardContent className="p-8 space-y-6">
                <div className="text-center">
                  <p className="text-sm text-slate-500 uppercase font-bold">Lance Atual</p>
                  <p className="text-4xl font-black text-slate-900">{formatCurrency(lot.current_bid)}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Seu Lance</Label>
                    <Input 
                      type="number" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="text-2xl font-bold h-16 text-center rounded-xl border-2 focus:border-orange-500"
                    />
                  </div>
                  <p className="text-xs text-center text-slate-400">
                    Incremento mínimo obrigatório: <span className="font-bold text-slate-600">{formatCurrency(minIncrement)}</span>
                  </p>
                  <Button 
                    onClick={handleBid}
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 rounded-2xl text-xl font-black shadow-lg transition-all"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'CONFIRMAR LANCE'}
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
                  <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                  <p className="text-[10px] text-blue-800 leading-tight">
                    Este leilão possui <strong>Anti-Sniper</strong>. Lances nos últimos 2 minutos estendem o tempo automaticamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotDetail;