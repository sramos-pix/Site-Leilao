"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import FeaturedLots from "@/components/FeaturedLots";
import FeaturedAuctions from "@/components/FeaturedAuctions";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Menu Superior */}
      <Navbar />
      
      {/* Conteúdo Principal */}
      <main className="flex-1">
        {/* Banner Promocional (Só aparece se estiver ativo no painel) */}
        <HeroBanner />
        
        {/* Leilões em Destaque */}
        <FeaturedLots />
        
        {/* Lotes/Veículos Destaques da Semana */}
        <FeaturedAuctions />
      </main>

      {/* Rodapé */}
      <Footer />
    </div>
  );
};

export default Index;