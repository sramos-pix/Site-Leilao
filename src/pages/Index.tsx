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
  // Schema Markup para a página inicial (Organization e WebSite)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AutoBid",
    "url": "https://autobidbr.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://autobidbr.com/vehicles?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <SEO
        title="AutoBid - Leilões de Veículos Online"
        description="Participe dos melhores leilões de veículos online. Encontre carros, motos e caminhões de frota, recuperados e seminovos com preços imperdíveis. Cadastre-se e dê seu lance!"
        keywords="leilão de carros, leilão de motos, leilão online, comprar carro barato, carros de frota, leilão de veículos, autobid"
        schema={schemaData}
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