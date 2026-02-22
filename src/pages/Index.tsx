"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HeroBanner from "@/components/HeroBanner";
import FeaturedLots from "@/components/FeaturedLots";
import FeaturedAuctions from "@/components/FeaturedAuctions";
import Footer from "@/components/Footer";
import SupportChatWidget from "@/components/SupportChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
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