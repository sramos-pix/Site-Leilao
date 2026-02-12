import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Info, Gavel, Clock, 
  ChevronRight, ShieldCheck, FileText, Users 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, formatCurrency } from '@/lib/utils';

// Mock data for Auction Detail
const MOCK_AUCTION = {
  id: '1',
  title: 'Leilão de Frota Executiva - SP',
  description: 'Grande oportunidade de adquirir veículos de frota executiva com baixa quilometragem e manutenção rigorosa em dia. Veículos provenientes de renovação de frota de multinacional.',
  status: 'live',
  starts_at: new Date().toISOString(),
  ends_at: new Date(Date.now() + 86400000 * 2).toISOString(),
  location: 'Av. das Nações Unidas, 12345 - São Paulo, SP',
  buyer_fee_percent: 5,
  requires_deposit: true,
  deposit_amount: 1000,
  lots: [
    {
      id: 'l1',
      lot_number: 1,
      title: 'BMW 320i M Sport 2022',
      brand: 'BMW',
      model: '320i',
      year: 2022,
      mileage_km: 15000,
      current_bid: 215000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'l2',
      lot_number: 2,
      title: 'Audi A4 Performance 2021',
      brand: 'Audi',
      model: 'A4',
      year: 2021,
      mileage_km: 28000,
      current_bid: 185000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'l3',
      lot_number: 3,
      title: 'Mercedes-Benz C300 AMG Line 2022',
      brand: 'Mercedes-Benz',
      model: 'C300',
      year: 2022,
      mileage_km: 12000,
      current_bid: 245000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
    }
  ]
};

const AuctionDetail = () => {
  const { id } = useParams();
  const auction = MOCK_AUCTION; // In real app, fetch by id

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-slate-900 text-white pt-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1">
                  LEILÃO {auction.status === 'live' ? 'AO VIVO' : 'AGENDADO'}
                </Badge>
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <MapPin size={14} />
                  {auction.location.split('-')[1]}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6">{auction.title}</h1>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                {auction.description}
              </p>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Calendar className="text-orange-500" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Início</p>
                    <p className="font-semibold">{formatDate(auction.starts_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Clock className="text-orange-500" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Encerramento</p>
                    <p className="font-semibold">{formatDate(auction.ends_at)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="w-full md:w-80 bg-white/5 border-white/10 backdrop-blur-sm text-white">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Taxa do Comprador</p>
                  <p className="text-2xl font-bold text-orange-500">{auction.buyer_fee_percent}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Depósito de Garantia</p>
                  <p className="text-2xl font-bold">{formatCurrency(auction.deposit_amount)}</p>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-xl font-bold">
                  Habilitar-se para Lances
                </Button>
                <p className="text-[10px] text-center text-slate-500 uppercase tracking-wider">
                  Requer validação de documentos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 -mt-12">
        <Tabs defaultValue="lots" className="w-full">
          <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <TabsTrigger value="lots" className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              Lotes ({auction.lots.length})
            </TabsTrigger>
            <TabsTrigger value="info" className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              Informações e Regras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lots">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {auction.lots.map((lot) => (
                <Card key={lot.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={lot.image} 
                      alt={lot.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-none">
                        LOTE {lot.lot_number}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{lot.title}</h3>
                        <p className="text-sm text-slate-500">{lot.year} • {lot.mileage_km.toLocaleString()} km</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-4 mb-6">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Lance Atual</p>
                      <p className="text-2xl font-black text-slate-900">{formatCurrency(lot.current_bid)}</p>
                    </div>

                    <Link to={`/lots/${lot.id}`}>
                      <Button variant="outline" className="w-full border-2 border-slate-100 hover:border-orange-500 hover:text-orange-600 rounded-xl py-6 font-bold">
                        Ver Detalhes e Lances
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Info className="text-orange-500" />
                    Regras do Leilão
                  </h3>
                  <div className="space-y-4 text-slate-600 leading-relaxed">
                    <p>1. O leilão será realizado de forma online através desta plataforma.</p>
                    <p>2. Para participar, o usuário deve estar com o cadastro aprovado e ter efetuado o depósito de garantia, se exigido.</p>
                    <p>3. Cada lance dado nos últimos 2 minutos estende o cronômetro em mais 2 minutos (Anti-sniping).</p>
                    <p>4. O arrematante deverá pagar a comissão do leiloeiro (5%) sobre o valor do arremate.</p>
                  </div>
                </section>

                <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="text-orange-500" />
                    Visitação e Retirada
                  </h3>
                  <div className="space-y-4 text-slate-600">
                    <p><strong>Visitação:</strong> De segunda a sexta, das 09h às 17h, mediante agendamento prévio.</p>
                    <p><strong>Local:</strong> {auction.location}</p>
                    <p><strong>Retirada:</strong> Após a confirmação do pagamento integral e taxas, em até 5 dias úteis.</p>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                  <ShieldCheck className="text-orange-600 mb-4" size={32} />
                  <h4 className="text-lg font-bold text-orange-900 mb-2">Compra Garantida</h4>
                  <p className="text-sm text-orange-800/70 leading-relaxed">
                    Todos os veículos deste leilão possuem laudo cautelar aprovado e documentação pronta para transferência.
                  </p>
                </div>
                
                <div className="bg-slate-900 p-8 rounded-3xl text-white">
                  <Users className="text-orange-500 mb-4" size={32} />
                  <h4 className="text-lg font-bold mb-2">Suporte Especializado</h4>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    Dúvidas sobre este leilão? Nossa equipe está pronta para ajudar.
                  </p>
                  <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold">
                    Falar com Consultor
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuctionDetail;
