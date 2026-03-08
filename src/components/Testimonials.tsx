"use client";

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    name: "Ricardo C.",
    role: "Honda Civic 2014",
    content: "Arrematei um Honda Civic 2014 por R$ 28.000 — a FIPE estava em R$ 47.000. Economia de R$ 19.000! O processo foi transparente do início ao fim.",
    initials: "RC",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
    paidValue: "R$ 28.000",
    fipeValue: "R$ 47.000",
    savings: "R$ 19.000",
    rating: 5
  },
  {
    name: "Juliana M.",
    role: "Toyota Corolla 2019",
    content: "Era meu primeiro leilão e estava com receio, mas o suporte por WhatsApp me ajudou em cada etapa. Consegui um Corolla com 42% de desconto sobre a FIPE!",
    initials: "JM",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    paidValue: "R$ 52.000",
    fipeValue: "R$ 89.500",
    savings: "R$ 37.500",
    rating: 5
  },
  {
    name: "Marcos V.",
    role: "Investidor — 3 veículos arrematados",
    content: "Já comprei 3 veículos na AutoBid para revenda. A margem é excelente e a documentação sempre está em dia. Plataforma séria e confiável.",
    initials: "MV",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-600",
    paidValue: "R$ 35.000",
    fipeValue: "R$ 58.000",
    savings: "R$ 23.000",
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

                <p className="text-slate-600 leading-relaxed mb-4 italic relative z-10">
                  "{t.content}"
                </p>

                {/* Comparativo de economia */}
                <div className="bg-emerald-50 rounded-xl p-3 mb-6 border border-emerald-100">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 font-bold">Pagou:</span>{' '}
                      <span className="font-black text-slate-700">{t.paidValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">FIPE:</span>{' '}
                      <span className="font-bold text-slate-500 line-through">{t.fipeValue}</span>
                    </div>
                  </div>
                  <p className="text-emerald-600 font-black text-sm mt-1 text-center">
                    Economia de {t.savings}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${t.bgColor} rounded-2xl flex items-center justify-center ${t.textColor} font-bold text-lg shadow-md`}>
                    {t.initials}
                  </div>
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