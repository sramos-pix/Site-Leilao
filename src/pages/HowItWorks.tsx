"use client";

import React from 'react';
import { Gavel, UserPlus, ShieldCheck, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "1. Cadastro e Verificação",
      description: "Crie sua conta e envie seus documentos (RG/CNH) para verificação. Isso garante a segurança de todos os participantes."
    },
    {
      icon: ShieldCheck,
      title: "2. Habilitação",
      description: "Após a aprovação do seu perfil, você poderá se habilitar nos leilões de seu interesse e ler os editais específicos."
    },
    {
      icon: Gavel,
      title: "3. Dê seus Lances",
      description: "Participe em tempo real. Você pode dar lances manuais ou configurar lances automáticos para não perder a oportunidade."
    },
    {
      icon: Trophy,
      title: "4. Arremate e Pagamento",
      description: "Se o seu lance for o vencedor, você receberá as instruções para pagamento via boleto ou transferência bancária judicial."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-slate-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6">Como Funciona o <span className="text-orange-500">AutoBid</span></h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Comprar seu veículo em leilão nunca foi tão simples, transparente e seguro. Siga os passos abaixo.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative group hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <step.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-orange-500">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-black mb-8">Pronto para começar sua jornada?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 px-10 py-7 rounded-2xl font-bold text-lg w-full sm:w-auto">
                  Criar Conta Agora
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 px-10 py-7 rounded-2xl font-bold text-lg w-full sm:w-auto">
                  Tirar Dúvidas
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;