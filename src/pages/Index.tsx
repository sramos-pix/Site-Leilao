"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HeroBanner from "@/components/HeroBanner";
import FeaturedLots from "@/components/FeaturedLots";
import FeaturedAuctions from "@/components/FeaturedAuctions";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Menu Superior */}
      <Navbar />
      
      {/* Conteúdo Principal */}
      <main className="flex-1">
        {/* 1. Banner Promocional (Aparece no topo, abaixo do menu, se estiver ativo) */}
        <HeroBanner />
        
        {/* 2. Texto Grande e Chamativo (Restaurado!) */}
        <Hero />
        
        {/* 3. Listagem de Lotes e Leilões */}
        <FeaturedLots />
        <FeaturedAuctions />
      </main>

      {/* Rodapé */}
      <Footer />
    </div>
  );
};

export default Index;