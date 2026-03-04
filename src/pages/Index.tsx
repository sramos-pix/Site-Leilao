"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturedAuctions from '@/components/FeaturedAuctions';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';

const schemaData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AutoBid Leilões",
    "url": "https://autobidbr.com",
    "logo": "https://autobidbr.com/autobid-logo.svg",
    "description": "A melhor plataforma de leilões de veículos do Brasil. Carros, motos e caminhões com os melhores preços.",
    "foundingDate": "2023",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Portuguese"
    },
    "sameAs": [
      "https://www.facebook.com/autobidbr",
      "https://www.instagram.com/autobidbr"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AutoBid Leilões",
    "url": "https://autobidbr.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://autobidbr.com/vehicles?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Como participar de um leilão de veículos na AutoBid?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "É simples: crie sua conta gratuita, envie seus documentos para verificação, habilite-se no leilão desejado e comece a dar lances em tempo real. Todo o processo é 100% online e seguro."
        }
      },
      {
        "@type": "Question",
        "name": "Os veículos leiloados têm documentação garantida?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim. Todos os veículos disponíveis na AutoBid passam por vistoria e têm a documentação verificada antes de entrar em leilão."
        }
      },
      {
        "@type": "Question",
        "name": "Quanto custa participar dos leilões da AutoBid?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "O cadastro e a participação nos leilões são gratuitos. Em caso de arremate, aplica-se uma taxa do comprador sobre o valor do lance vencedor."
        }
      },
      {
        "@type": "Question",
        "name": "É seguro comprar carro em leilão online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim, na AutoBid todos os participantes são verificados, os veículos são vistoriados e os pagamentos são processados com segurança via Pix bancário judicial."
        }
      }
    ]
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="AutoBid - Leilões de Veículos Online | Carros, Motos e Caminhões"
        description="Compre carros, motos e caminhões em leilão com até 70% de desconto. Leilões online 100% seguros, com documentação garantida. Cadastro gratuito. Participe agora!"
        keywords="leilão de carros, leilão de veículos online, comprar carro barato, leilão de motos, leilão de caminhões, carros leilão, autobid, leilão online brasil, carros seminovos leilão, leilão de frota"
        schema={schemaData}
      />
      <Navbar />
      <Hero />
      <FeaturedAuctions />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;