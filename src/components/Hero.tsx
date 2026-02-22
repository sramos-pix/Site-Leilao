"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gavel, ArrowRight, ShieldCheck, Car } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-slate-900 overflow-hidden">
      {/* Background com imagem e overlay escuro */}
      <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1600661653561-629509216228?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/40" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold text-sm mb-6 border border-orange-500/20">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            A Maior Plataforma de Leilões
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Encontre o seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">próximo veículo</span> aqui.
          </h1>
          
          <p className="text-lg text-slate-300 mb-10 font-medium leading-relaxed max-w-xl">
            Participe de leilões online com segurança, transparência e as melhores oportunidades do mercado. Cadastre-se e dê o seu lance!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-14 px-8 text-lg font-bold shadow-lg shadow-orange-600/20 transition-all hover:-translate-y-1">
              <Link to="/auctions">
                Ver Leilões <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl h-14 px-8 text-lg font-bold backdrop-blur-sm transition-all hover:-translate-y-1">
              <Link to="/register">
                Criar Conta Grátis
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap items-center gap-6 sm:gap-8 text-slate-400 text-sm font-bold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-orange-500" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-orange-500" />
              <span>Lances em Tempo Real</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-orange-500" />
              <span>Veículos Vistoriados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;