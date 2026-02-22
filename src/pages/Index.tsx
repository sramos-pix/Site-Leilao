"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HeroBanner from "@/components/HeroBanner";
import FeaturedLots from "@/components/FeaturedLots";
import FeaturedAuctions from "@/components/FeaturedAuctions";
import Footer from "@/components/Footer";
import SupportChatWidget from "@/components/SupportChatWidget";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <SEO
        title="AutoBid - Leilões de Veículos"
        description="Encontre os melhores veículos em leilão. Carros, motos e caminhões com preços imperdíveis. Participe agora e faça seu lance!"
      />
      {/* Menu Superior */}
      <Navbar />
      
      {/* Conteúdo Principal */}
      <main className="flex-1">
        {/* Banner Promocional */}
        <HeroBanner />
        
        {/* Texto Grande e Chamativo */}
        <Hero />
        
        {/* Listagem de Lotes e Leilões */}
        <FeaturedLots />
        <FeaturedAuctions />
      </main>

      {/* Rodapé */}
      <Footer />

      {/* Widget de Chat Flutuante */}
      <SupportChatWidget />
    </div>
  );
};

export default Index;