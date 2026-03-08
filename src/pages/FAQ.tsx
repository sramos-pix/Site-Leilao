"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, UserPlus, Gavel, CreditCard, Car, ShieldCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';

const categories = [
  {
    id: 'cadastro',
    icon: UserPlus,
    label: 'Cadastro e Verificação',
    questions: [
      {
        q: 'Como faço para criar minha conta na AutoBid?',
        a: 'Clique em "Criar Conta" no topo do site, preencha seus dados (nome, e-mail e senha) e confirme seu e-mail. O cadastro é 100% gratuito e leva menos de 2 minutos.'
      },
      {
        q: 'Quais documentos preciso enviar para verificação?',
        a: 'Você precisa enviar uma foto do seu RG ou CNH (frente e verso) e um selfie segurando o documento. A verificação garante a segurança de todos os participantes dos leilões.'
      },
      {
        q: 'Quanto tempo leva para minha conta ser verificada?',
        a: 'A verificação de documentos é concluída em até 24 horas úteis após o envio. Você receberá um e-mail assim que sua conta for aprovada.'
      },
      {
        q: 'Posso participar dos leilões sem verificar minha conta?',
        a: 'Não. A verificação de identidade é obrigatória para dar lances. Ela protege você e todos os outros participantes, garantindo que apenas pessoas reais estejam competindo.'
      },
    ]
  },
  {
    id: 'lances',
    icon: Gavel,
    label: 'Lances e Leilões',
    questions: [
      {
        q: 'Como funciona o leilão online?',
        a: 'Após verificar sua conta, você se habilita no leilão desejado e começa a dar lances em tempo real. O leilão tem data e hora de encerramento. Quem tiver o maior lance no momento do encerramento arrematará o veículo.'
      },
      {
        q: 'O que é o lance automático?',
        a: 'O lance automático permite que você defina um valor máximo que está disposto a pagar. O sistema dará lances automaticamente em seu nome até atingir esse limite, assim você não precisa ficar monitorando o leilão o tempo todo.'
      },
      {
        q: 'Qual é o valor mínimo de incremento por lance?',
        a: 'O incremento mínimo varia por leilão e está sempre informado na página do lote. Em geral, os incrementos partem de R$ 500,00.'
      },
      {
        q: 'Posso cancelar um lance após confirmá-lo?',
        a: 'Não. Uma vez confirmado, o lance é definitivo e vinculante. Por isso, confira bem o valor antes de confirmar.'
      },
      {
        q: 'O que acontece se dois lances forem enviados ao mesmo tempo?',
        a: 'Nosso sistema registra o timestamp exato de cada lance. Em caso de empate de valor, prevalece o lance enviado primeiro.'
      },
    ]
  },
  {
    id: 'pagamento',
    icon: CreditCard,
    label: 'Pagamento e Taxas',
    questions: [
      {
        q: 'Quanto custa participar dos leilões?',
        a: 'O cadastro e a participação nos leilões são 100% gratuitos. Você só paga se arrematar um veículo.'
      },
      {
        q: 'O que é a taxa do comprador?',
        a: 'A taxa do comprador é um percentual sobre o valor do arremate, informado no edital de cada leilão. Ela cobre os custos operacionais da plataforma. Essa taxa já é exibida na página do lote antes de você dar seu lance.'
      },
      {
        q: 'Quais formas de pagamento são aceitas?',
        a: 'O pagamento é realizado via Pix bancário judicial. Os dados e o prazo para pagamento são informados após o arremate.'
      },
      {
        q: 'Qual o prazo para pagar após arrematar?',
        a: 'O prazo de pagamento é definido no edital de cada leilão e geralmente varia de 24 a 72 horas. Fique atento ao e-mail que enviamos após o arremate.'
      },
      {
        q: 'O que acontece se eu não pagar no prazo?',
        a: 'O não pagamento no prazo acarreta na perda do arremate, cobrança de multa e possível bloqueio da conta na plataforma. Certifique-se de ter os recursos disponíveis antes de participar.'
      },
    ]
  },
  {
    id: 'veiculos',
    icon: Car,
    label: 'Veículos e Retirada',
    questions: [
      {
        q: 'Os veículos têm documentação garantida?',
        a: 'Sim. Todos os veículos disponíveis na AutoBid passam por vistoria e têm a situação do documento verificada antes de entrar em leilão. As informações relevantes constam no edital.'
      },
      {
        q: 'Como sei o estado real do veículo antes de dar meu lance?',
        a: 'Cada lote possui fotos detalhadas de todos os ângulos, descrição completa do estado de conservação, quilometragem, ano e condição. Avalie tudo pelo site antes de dar seu lance — 100% online e transparente.'
      },
      {
        q: 'Como funciona a retirada do veículo após o arremate?',
        a: 'Após a confirmação do pagamento, você receberá as instruções para retirada do veículo. A retirada deve ser feita no local indicado no edital, dentro do prazo estabelecido.'
      },
      {
        q: 'O veículo vem com nota fiscal?',
        a: 'Sim. Após o pagamento, providenciamos toda a documentação necessária para transferência do veículo para o seu nome, conforme previsto no edital de cada leilão.'
      },
    ]
  },
  {
    id: 'seguranca',
    icon: ShieldCheck,
    label: 'Segurança e Confiança',
    questions: [
      {
        q: 'A AutoBid é uma empresa confiável?',
        a: 'Sim. A AutoBid opera com processos auditados, verificação de identidade de todos os participantes e pagamentos via sistema bancário judicial. Sua segurança é nossa prioridade.'
      },
      {
        q: 'Meus dados pessoais estão seguros?',
        a: 'Sim. Seguimos todas as diretrizes da LGPD (Lei Geral de Proteção de Dados). Seus dados são criptografados e nunca são compartilhados com terceiros sem seu consentimento.'
      },
      {
        q: 'O que é o processo judicial dos leilões?',
        a: 'Muitos dos leilões realizados na plataforma são judiciais, ou seja, determinados pela Justiça. Isso garante total transparência e segurança jurídica para o comprador.'
      },
    ]
  },
];

const schemaData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": categories.flatMap(cat =>
    cat.questions.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a }
    }))
  )
};

const AccordionItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn(
      "border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200",
      open ? "bg-white shadow-md" : "bg-white hover:border-orange-200"
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-6 text-left"
      >
        <span className="font-bold text-slate-900 text-base leading-snug">{question}</span>
        <ChevronDown
          size={20}
          className={cn(
            "text-orange-500 shrink-0 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="px-6 pb-6">
          <p className="text-slate-600 leading-relaxed text-sm border-t border-slate-100 pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('cadastro');
  const current = categories.find(c => c.id === activeCategory)!;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEO
        title="Perguntas Frequentes sobre Leilão de Veículos | FAQ AutoBid"
        description="Tire todas as suas dúvidas sobre leilão de carros, motos e caminhões. Como funciona, cadastro, pagamento, retirada e mais. FAQ completo da AutoBid."
        keywords="dúvidas leilão de carros, FAQ leilão de veículos, perguntas leilão online, como funciona leilão, taxa leilão, pagamento leilão, retirada veículo leilão"
        schema={schemaData}
      />
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-500/5 blur-[100px]" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
              <HelpCircle size={14} />
              Central de Ajuda
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              Perguntas <span className="text-orange-500">Frequentes</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Encontre respostas rápidas sobre cadastro, lances, pagamentos e muito mais.
            </p>
          </div>
        </section>

        {/* Conteúdo */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

              {/* Sidebar de categorias */}
              <aside className="lg:w-64 shrink-0">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 lg:sticky lg:top-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">Categorias</p>
                  <nav className="flex flex-col gap-1">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
                          activeCategory === cat.id
                            ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <cat.icon size={18} className="shrink-0" />
                        {cat.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Perguntas */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                    <current.icon size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{current.label}</h2>
                    <p className="text-sm text-slate-400">{current.questions.length} perguntas</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {current.questions.map((item, i) => (
                    <AccordionItem key={i} question={item.q} answer={item.a} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-orange-500">
          <div className="container mx-auto px-4 text-center text-white">
            <MessageSquare size={40} className="mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-black mb-4">Não encontrou sua resposta?</h2>
            <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
              Nossa equipe está pronta para te ajudar. Fale com a gente agora mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 px-10 py-7 rounded-2xl font-bold text-lg w-full sm:w-auto">
                  Falar com o Suporte
                </Button>
              </Link>
              <Link to="/auctions">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-10 py-7 rounded-2xl font-bold text-lg w-full sm:w-auto">
                  Ver Leilões Ativos
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

export default FAQ;
