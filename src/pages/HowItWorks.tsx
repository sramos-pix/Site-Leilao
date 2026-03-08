"use client";

import React from 'react';
import { Gavel, UserPlus, ShieldCheck, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';

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
      description: "Após sua conta ser verificada, escolha o leilão que deseja participar e clique em 'Habilitar' — é gratuito, instantâneo e feito em 1 clique. Você também pode ler o edital completo para ver todas as condições do leilão.",
      badge: "Gratuito e Instantâneo"
    },
    {
      icon: Gavel,
      title: "3. Dê seus Lances",
      description: "Participe em tempo real. Você pode dar lances manuais ou configurar lances automáticos para não perder a oportunidade."
    },
    {
      icon: Trophy,
      title: "4. Arremate e Pagamento",
      description: "Se o seu lance for o vencedor, você receberá as instruções para pagamento via Pix bancário judicial."
    }
  ];

  const schemaData = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "Como participar de leilões de veículos na AutoBid",
      "description": "Aprenda passo a passo como se cadastrar, habilitar, dar lances e arrematar veículos em nossos leilões online.",
      "step": steps.map((step, index) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "name": step.title,
        "text": step.description
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Como funciona o leilão de veículos online?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "O leilão online funciona de forma simples: você se cadastra gratuitamente, envia seus documentos para verificação, se habilita no leilão desejado e começa a dar lances em tempo real pelo site. O maior lance no encerramento ganha o veículo."
          }
        },
        {
          "@type": "Question",
          "name": "Preciso pagar para participar do leilão?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Não. O cadastro e a participação nos leilões da AutoBid são totalmente gratuitos. Você só paga se arrematar um veículo, e nesse caso é cobrada uma taxa do comprador sobre o valor do arremate."
          }
        },
        {
          "@type": "Question",
          "name": "Quanto tempo leva para minha conta ser verificada?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A verificação de documentos geralmente é concluída em até 24 horas úteis após o envio."
          }
        },
        {
          "@type": "Question",
          "name": "Como funciona o pagamento após arrematar um veículo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Após o arremate, você recebe as instruções de pagamento via Pix bancário judicial. O prazo para pagamento é informado no edital de cada leilão."
          }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEO
        title="Como Funciona o Leilão de Veículos Online | AutoBid"
        description="Aprenda como comprar carros em leilão online: cadastro grátis, habilitação simples, lances em tempo real e arremate seguro. Veja o passo a passo completo da AutoBid."
        keywords="como funciona leilão de carros, como comprar carro em leilão, participar de leilão online, arrematar carro, leilão seguro, passo a passo leilão, leilão de veículos como funciona, cadastro leilão online"
        schema={schemaData}
      />
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
              {steps.map((step: any, index) => (
                <div key={index} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative group hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <step.icon size={32} />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    {step.badge && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold px-2 py-0.5 shrink-0">
                        {step.badge}
                      </Badge>
                    )}
                  </div>
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
              <Link to="/register">
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