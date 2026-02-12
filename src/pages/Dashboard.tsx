import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Gavel, Wallet, Heart, 
  Trophy, User, Bell, ChevronRight, TrendingUp,
  Clock, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

const Dashboard = () => {
  const stats = [
    { label: 'Lances Ativos', value: '12', icon: Gavel, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Vitórias', value: '03', icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Favoritos', value: '08', icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Saldo Depósito', value: 'R$ 1.000', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Olá, João Silva</h1>
            <p className="text-slate-500">Bem-vindo ao seu painel de controle.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl bg-white border-none shadow-sm">
              <Bell size={20} className="mr-2" />
              Notificações
            </Badge>
            <Link to="/app/profile">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                <User size={20} className="mr-2" />
                Meu Perfil
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={stat.color} size={24} />
                  </div>
                  <Badge variant="outline" className="border-slate-100 text-slate-400">Este mês</Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Bids */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Lances em Andamento</h2>
              <Link to="/app/bids" className="text-sm text-orange-600 font-semibold hover:underline">Ver todos</Link>
            </div>
            
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 h-32 bg-slate-200">
                        <img 
                          src={`https://images.unsplash.com/photo-${i === 1 ? '1555215695-3004980ad54e' : '1606664515524-ed2f786a0bd6'}?auto=format&fit=crop&q=80&w=400`} 
                          className="w-full h-full object-cover"
                          alt="Veículo"
                        />
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-900">{i === 1 ? 'BMW 320i M Sport' : 'Audi A4 Performance'}</h3>
                            <p className="text-xs text-slate-500">Lote {i} • Leilão Frota Executiva</p>
                          </div>
                          <Badge className={i === 1 ? "bg-green-100 text-green-600 border-none" : "bg-red-100 text-red-600 border-none"}>
                            {i === 1 ? 'Ganhando' : 'Perdendo'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Seu Lance</p>
                            <p className="font-bold text-slate-900">{formatCurrency(i === 1 ? 215000 : 185000)}</p>
                          </div>
                          <Link to={`/lots/${i}`}>
                            <Button size="sm" variant="outline" className="rounded-lg">
                              Ver Lote
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar: Notifications & Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Ações Rápidas</h2>
            <div className="grid grid-cols-1 gap-3">
              <Button className="w-full justify-between bg-white text-slate-900 hover:bg-slate-50 border-none shadow-sm h-14 rounded-xl px-6">
                <span className="flex items-center gap-3">
                  <Wallet className="text-orange-500" size={20} />
                  Adicionar Saldo
                </span>
                <ChevronRight size={16} className="text-slate-400" />
              </Button>
              <Button className="w-full justify-between bg-white text-slate-900 hover:bg-slate-50 border-none shadow-sm h-14 rounded-xl px-6">
                <span className="flex items-center gap-3">
                  <ShieldCheck className="text-orange-500" size={20} />
                  Validar Documentos
                </span>
                <ChevronRight size={16} className="text-slate-400" />
              </Button>
            </div>

            <Card className="border-none shadow-sm rounded-2xl bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="text-orange-500" size={20} />
                  Aviso Importante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Você tem um pagamento pendente referente ao lote arrematado no Leilão #42. O prazo encerra em 24h.
                </p>
                <Button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                  Pagar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
