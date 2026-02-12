import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Heart, Share2, Clock, Gavel, 
  ShieldCheck, Info, MapPin, Calendar, Gauge, 
  Fuel, Settings2, Palette, History, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate, maskEmail } from '@/lib/utils';

// Mock data for Lot Detail
const MOCK_LOT = {
  id: 'l1',
  auction_id: '1',
  lot_number: 1,
  title: 'BMW 320i M Sport 2022',
  brand: 'BMW',
  model: '320i',
  version: 'M Sport',
  year: 2022,
  mileage_km: 15240,
  fuel: 'Flex',
  transmission: 'Automático',
  color: 'Branco Alpino',
  city: 'São Paulo',
  state: 'SP',
  plate_masked: '***-**42',
  vin_masked: '9BW***001',
  condition_notes: 'Veículo em excelente estado de conservação. Único dono, revisões em concessionária. Pneus novos.',
  start_bid: 180000,
  current_bid: 215000,
  min_increment: 500,
  ends_at: new Date(Date.now() + 3600000 * 2).toISOString(),
  images: [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1556122071-e404deed857d?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&q=80&w=1200'
  ],
  bids: [
    { id: 'b1', user_email: 'joao@email.com', amount: 215000, created_at: new Date(Date.now() - 600000).toISOString() },
    { id: 'b2', user_email: 'maria@email.com', amount: 214500, created_at: new Date(Date.now() - 1200000).toISOString() },
    { id: 'b3', user_email: 'carlos@email.com', amount: 214000, created_at: new Date(Date.now() - 1800000).toISOString() },
  ]
};

const LotDetail = () => {
  const { id } = useParams();
  const lot = MOCK_LOT; // In real app, fetch by id
  const [bidAmount, setBidAmount] = React.useState(lot.current_bid + lot.min_increment);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <Link to={`/auctions/${lot.auction_id}`} className="flex items-center text-slate-500 hover:text-orange-600 transition-colors font-medium">
            <ChevronLeft size={20} />
            Voltar para o Leilão
          </Link>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl bg-white border-none shadow-sm">
              <Heart size={18} className="mr-2" />
              Favoritar
            </Button>
            <Button variant="outline" className="rounded-xl bg-white border-none shadow-sm">
              <Share2 size={18} className="mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Images & Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-lg">
                <img src={lot.images[0]} alt={lot.title} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {lot.images.slice(1).map((img, i) => (
                  <div key={i} className="aspect-video rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
                    <img src={img} alt={`${lot.title} ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="aspect-video rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 font-bold cursor-pointer hover:bg-slate-300 transition-colors">
                  +5 fotos
                </div>
              </div>
            </div>

            {/* Vehicle Specs */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <Badge className="bg-orange-100 text-orange-600 border-none mb-2">LOTE {lot.lot_number}</Badge>
                  <h1 className="text-3xl font-bold text-slate-900">{lot.title}</h1>
                  <p className="text-slate-500 flex items-center gap-2 mt-1">
                    <MapPin size={16} />
                    {lot.city}, {lot.state}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Calendar size={14} /> Ano
                  </p>
                  <p className="font-bold text-slate-900">{lot.year}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Gauge size={14} /> KM
                  </p>
                  <p className="font-bold text-slate-900">{lot.mileage_km.toLocaleString()} km</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Fuel size={14} /> Combustível
                  </p>
                  <p className="font-bold text-slate-900">{lot.fuel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Settings2 size={14} /> Câmbio
                  </p>
                  <p className="font-bold text-slate-900">{lot.transmission}</p>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Info className="text-orange-500" />
                  Descrição e Observações
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {lot.condition_notes}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Placa</span>
                    <span className="font-mono font-bold">{lot.plate_masked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chassi</span>
                    <span className="font-mono font-bold">{lot.vin_masked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cor</span>
                    <span className="font-bold">{lot.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Versão</span>
                    <span className="font-bold">{lot.version}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bidding Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Bid Card */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden sticky top-24">
              <div className="bg-slate-900 p-6 text-white">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Clock size={18} className="animate-pulse" />
                    <span className="text-sm font-bold uppercase tracking-wider">Encerra em</span>
                  </div>
                  <Badge className="bg-red-500 text-white border-none">AO VIVO</Badge>
                </div>
                <div className="text-3xl font-mono font-bold text-center py-2 bg-white/10 rounded-xl">
                  01:42:15
                </div>
              </div>
              
              <CardContent className="p-8 space-y-8">
                <div className="text-center">
                  <p className="text-sm text-slate-500 uppercase font-bold mb-1">Lance Atual</p>
                  <p className="text-4xl font-black text-slate-900">{formatCurrency(lot.current_bid)}</p>
                  <p className="text-xs text-slate-400 mt-2">Vendedor: Empresa de Frota S.A.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="text-2xl font-bold h-16 text-center rounded-xl border-2 focus:border-orange-500"
                    />
                  </div>
                  <p className="text-xs text-center text-slate-400">
                    Incremento mínimo: <span className="font-bold text-slate-600">{formatCurrency(lot.min_increment)}</span>
                  </p>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 rounded-2xl text-xl font-black shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    DAR LANCE AGORA
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
                  <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Ao dar um lance, você concorda com os termos do leilão e se compromete ao pagamento em caso de vitória.
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <History size={18} className="text-slate-400" />
                    Últimos Lances
                  </h4>
                  <div className="space-y-3">
                    {lot.bids.map((bid, i) => (
                      <div key={bid.id} className={`flex justify-between items-center p-3 rounded-xl ${i === 0 ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50'}`}>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{maskEmail(bid.user_email)}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(bid.created_at)}</span>
                        </div>
                        <span className={`font-bold ${i === 0 ? 'text-orange-600' : 'text-slate-600'}`}>
                          {formatCurrency(bid.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Card */}
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4">
              <AlertTriangle className="text-amber-600 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-amber-900 text-sm mb-1">Atenção às Taxas</h4>
                <p className="text-xs text-amber-800/70 leading-relaxed">
                  Lembre-se que sobre o valor do lance incide a taxa do leiloeiro (5%) e taxas administrativas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotDetail;
