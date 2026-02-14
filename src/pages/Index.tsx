import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import FeaturedAuctions from '@/components/FeaturedAuctions';
import FeaturedLots from '@/components/FeaturedLots';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
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
                  <Link to="/auth/register">
                    <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl border-2 w-full sm:w-auto bg-white">
                      Cadastre-se Grátis
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-1/2 h-full bg-orange-500/5 rounded-full blur-3xl" />
        </section>

        {/* Featured Lots (Veículos Individuais) */}
        <FeaturedLots />

        {/* Featured Auctions (Eventos de Leilão) */}
        <FeaturedAuctions />

        {/* Features Section */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Segurança Total</h3>
                <p className="text-slate-600">Processos auditados e veículos com procedência verificada.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Lances em Tempo Real</h3>
                <p className="text-slate-600">Sistema de lances instantâneo com tecnologia realtime.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <Trophy className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Melhores Preços</h3>
                <p className="text-slate-600">Oportunidades exclusivas com valores abaixo da tabela FIPE.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;