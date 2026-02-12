import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Trophy, Car, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-orange-600 uppercase bg-orange-100 rounded-full">
                Leilões de Veículos com Transparência
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
                Encontre seu próximo <span className="text-orange-500">veículo</span> pelo melhor preço.
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Participe de leilões online seguros, com veículos periciados e documentação garantida. A forma mais inteligente de comprar seu carro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auctions">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-xl w-full sm:w-auto">
                    Ver leilões ativos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl border-2 w-full sm:w-auto">
                    Como funciona
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-1/2 h-full bg-orange-500/5 rounded-full blur-3xl" />
      </section>

      {/* Stats/Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Segurança Total</h3>
              <p className="text-slate-600">Processos auditados, pagamentos seguros via Stripe e veículos com procedência verificada.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lances em Tempo Real</h3>
              <p className="text-slate-600">Sistema de lances instantâneo com tecnologia realtime para você não perder nenhuma oportunidade.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Trophy className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Melhores Preços</h3>
              <p className="text-slate-600">Oportunidades exclusivas com valores abaixo da tabela FIPE. Economia real garantida.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions Placeholder */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Leilões em Destaque</h2>
              <p className="text-slate-600">Confira as melhores oportunidades selecionadas para você.</p>
            </div>
            <Link to="/auctions" className="text-orange-600 font-semibold flex items-center hover:underline">
              Ver todos <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder Cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="aspect-video bg-slate-200 relative">
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    AO VIVO
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Leilão de Frota Executiva #{i}</h3>
                  <p className="text-slate-500 text-sm mb-4">São Paulo, SP • 12 veículos</p>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Encerra em</p>
                      <p className="font-mono font-bold text-slate-900">02d 14h 35m</p>
                    </div>
                    <Button variant="outline" className="rounded-lg border-orange-200 text-orange-600 hover:bg-orange-50">
                      Ver Lotes
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-slate-900 rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para dar seu primeiro lance?</h2>
              <p className="text-slate-400 text-lg mb-10">
                Cadastre-se agora, valide seus documentos e comece a participar dos melhores leilões do Brasil.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth?mode=signup">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-xl">
                    Criar conta gratuita
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="text-white border-slate-700 hover:bg-slate-800 px-8 py-6 rounded-xl">
                    Falar com consultor
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Car size={400} className="text-white -rotate-12 translate-x-1/4 translate-y-1/4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
