"use client";

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    name: "Ricardo Oliveira",
    role: "Arrematante Frequente",
    content: "O AutoBid facilitou muito a minha vida. O sistema de lances em tempo real é muito preciso e a transparência em todo o processo me dá a segurança que preciso para investir.",
    avatar: "https://i.pravatar.cc/150?u=ricardo",
    rating: 5
  },
  {
    name: "Juliana Costa",
    role: "Primeira Compra",
    content: "Estava com receio de participar de leilões online, mas o suporte do AutoBid foi incrível. Arrematei meu primeiro carro com um preço excelente e toda a documentação foi resolvida rápido.",
    avatar: "https://i.pravatar.cc/150?u=juliana",
    rating: 5
  },
  {
    name: "Marcos Vinícius",
    role: "Investidor",
    content: "Plataforma extremamente intuitiva. Os filtros de busca e as notificações de lances superados me ajudam a não perder nenhuma oportunidade de negócio. Recomendo!",
    avatar: "https://i.pravatar.cc/150?u=marcos",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-orange-600 font-black text-sm uppercase tracking-[0.2em] mb-4">DEPOIMENTOS</h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            O que nossos clientes dizem
          </h3>
          <p className="text-slate-500 text-lg">
            Milhares de pessoas já realizaram o sonho do carro novo ou fizeram excelentes negócios através da nossa plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <Card key={index} className="border-none shadow-xl shadow-slate-100/50 rounded-[2.5rem] bg-slate-50/50 hover:bg-white transition-all duration-500 group">
              <CardContent className="p-10 relative">
                <Quote className="absolute top-8 right-8 text-slate-200 group-hover:text-orange-100 transition-colors" size={48} />
                
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-orange-400 text-orange-400" />
                  ))}
                </div>

                <p className="text-slate-600 leading-relaxed mb-8 italic relative z-10">
                  "{t.content}"
                </p>

                <div className="flex items-center gap-4">
                  <img 
                    src={t.avatar} 
                    alt={t.name} 
                    className="w-14 h-14 rounded-2xl object-cover shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{t.name}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;