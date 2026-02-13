"use client";

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LotDetail from './pages/LotDetail';
import Admin from './pages/Admin';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import Vehicles from './pages/Vehicles';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import AppLayout from './components/layout/AppLayout';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetail />} />
        <Route path="/lots/:id" element={<LotDetail />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />

        {/* Rotas do Painel do Usuário (Protegidas por Layout) */}
        <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/app/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/app/verify" element={<AppLayout><Verify /></AppLayout>} />
        <Route path="/app/profile" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/app/bids" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/app/history" element={<AppLayout><Dashboard /></AppLayout>} />

        {/* Rota Administrativa */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;