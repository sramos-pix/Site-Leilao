"use client";

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Gavel, ShieldCheck, Clock, ArrowRight, CheckCircle2, HelpCircle, Car, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import CountdownTimer from '@/components/CountdownTimer';
import { SEO } from '@/components/SEO';

const LandingPage = () => {
  const [searchParams] = useSearchParams();
  const [featuredLots, setFeaturedLots] = useState<any[]>([]);

  // Preserva UTM params para rastreamento de conversão
  const utmParams = new URLSearchParams();
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
    const value = searchParams.get(key);
    if (value) utmParams.set(key, value);
  });
  const utmSuffix = utmParams.toString() ? `?${utmParams.toString()}` : '';

  useEffect(() => {
    const fetchLots = async () => {
      const { data } = await supabase
        .from('lots')
        .select('*')
        .eq('status', 'active')
        .order('current_bid', { ascending: true })
        .limit(6);
      setFeaturedLots(data || []);
    };
    fetchLots();
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Preciso pagar para participar?", a: "Não! O cadastro e a participação nos leilões são 100% gratuitos. Você só paga se arrematar um veículo." },
    { q: "Quanto tempo leva a verificação?", a: "A verificação de documentos é feita em até 24 horas úteis. Em muitos casos, é aprovada em poucos minutos." },
    { q: "Como funciona o pagamento?", a: "Após arrematar, você recebe instruções para pagamento via Pix bancário judicial. Rápido, seguro e direto." },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Carros até 40% Mais Baratos | Leilão Online AutoBid"
        description="Compre veículos em leilão com descontos de até 40% sobre a tabela FIPE. Cadastro gratuito, processo 100% online e seguro. Dê seu lance agora!"
      />

      {/* Mini header sem navegação */}
      <div className="bg-slate-900 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to={`/${utmSuffix}`}>
            <h1 className="text-xl font-black text-white">Auto<span className="text-orange-500">Bid</span></h1>
          </Link>
          <Link to={`/register${utmSuffix}`}>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-slate-900 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600661653561-629509216228?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900" />

        <div className="container mx-auto px-4 relative text-center max-w-3xl">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-6 px-4 py-1.5 text-sm font-bold">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse mr-2"></span>
            Leilões acontecendo agora
          </Badge>

          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Seu próximo carro até <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">40% mais barato</span>.
            <br />
            <span className="text-2xl md:text-3xl text-slate-300 font-bold">Sem burocracia, sem pegadinha.</span>
          </h2>

          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            Milhares de veículos disponíveis em leilão online. Seguro, transparente e com documentação garantida.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/auctions${utmSuffix}`}>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-14 px-10 text-lg font-bold shadow-lg shadow-orange-500/20 w-full sm:w-auto">
                Ver carros disponíveis <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Como Funciona - 3 passos */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-black text-slate-900 text-center mb-12">Como funciona em 3 passos simples</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl font-black text-orange-500">1</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">Cadastre-se grátis</h4>
              <p className="text-slate-500 text-sm">Crie sua conta em menos de 1 minuto. Sem taxa, sem compromisso.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl font-black text-orange-500">2</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">Envie seu documento</h4>
              <p className="text-slate-500 text-sm">Verificação rápida e gratuita para garantir a segurança de todos.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl font-black text-orange-500">3</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">Dê seu lance</h4>
              <p className="text-slate-500 text-sm">Escolha o veículo e dê seu lance em tempo real. Simples assim!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Carros em destaque */}
      {featuredLots.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-black text-slate-900 text-center mb-4">Oportunidades disponíveis agora</h3>
            <p className="text-slate-500 text-center mb-12">Veículos com lances a partir de valores incríveis</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredLots.map((lot) => (
                <Card key={lot.id} className="group border-none shadow-md hover:shadow-xl transition-all rounded-2xl overflow-hidden">
                  <Link to={`/lots/${lot.id}${utmSuffix}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {lot.cover_image_url ? (
                        <img src={lot.cover_image_url} alt={lot.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <Car size={40} className="text-orange-500" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-red-500 text-white border-none px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Clock size={12} />
                          <CountdownTimer randomScarcity={true} lotId={lot.id} />
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h4 className="font-bold text-slate-900 mb-2 line-clamp-1">{lot.title}</h4>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Lance Atual</p>
                          <p className="text-xl font-black text-slate-900">{formatCurrency(lot.current_bid || lot.start_bid)}</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-600 border-none font-bold text-xs">
                          DAR LANCE
                        </Badge>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to={`/auctions${utmSuffix}`}>
                <Button size="lg" className="bg-slate-900 hover:bg-orange-600 text-white rounded-xl px-10 font-bold">
                  Ver todos os veículos <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Prova Social */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h3 className="text-3xl font-black text-slate-900 text-center mb-12">Quem já arrematou aprova</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <span key={i} className="text-orange-400">★</span>)}
              </div>
              <p className="text-slate-600 text-sm mb-4 italic">
                "Arrematei um Honda Civic 2014 por R$ 28.000 — a FIPE estava em R$ 47.000. Economia de R$ 19.000!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">RC</div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Ricardo C.</p>
                  <p className="text-[10px] text-slate-400 font-bold">Honda Civic 2014</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <span key={i} className="text-orange-400">★</span>)}
              </div>
              <p className="text-slate-600 text-sm mb-4 italic">
                "Primeiro leilão e já consegui um Toyota Corolla com 42% de desconto. Processo muito transparente."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">JC</div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Juliana C.</p>
                  <p className="text-[10px] text-slate-400 font-bold">Toyota Corolla 2019</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <span key={i} className="text-orange-400">★</span>)}
              </div>
              <p className="text-slate-600 text-sm mb-4 italic">
                "Já comprei 3 veículos na AutoBid para revenda. A margem é excelente e o processo é super confiável."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">MV</div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Marcos V.</p>
                  <p className="text-[10px] text-slate-400 font-bold">Investidor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <h3 className="text-3xl font-black text-slate-900 text-center mb-12">Perguntas frequentes</h3>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
            Pronto para economizar no seu próximo carro?
          </h3>
          <p className="text-slate-400 mb-8">
            Cadastro gratuito, leilões 100% online e suporte por WhatsApp.
          </p>
          <Link to={`/register${utmSuffix}`}>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-14 px-10 text-lg font-bold shadow-lg shadow-orange-500/20">
              Criar conta grátis agora <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-slate-500 text-sm font-bold">
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-orange-500" /> 100% Seguro</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-orange-500" /> Sem taxas ocultas</div>
            <div className="flex items-center gap-2"><Gavel size={16} className="text-orange-500" /> Lances em tempo real</div>
          </div>
        </div>
      </section>

      {/* Footer mínimo */}
      <footer className="bg-slate-950 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} AutoBid Leilões. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
