"use client";

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LotDetail from './pages/LotDetail';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import Vehicles from './pages/Vehicles';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Verify from './pages/Verify';
import Verification from './pages/Verification';
import Admin from './pages/Admin';
import AdminGuard from './components/admin/AdminGuard';
import AppLayout from './components/layout/AppLayout';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';

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
        
        {/* Rotas do Painel do Usuário (Logado) */}
        <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/app/profile" element={<AppLayout><Profile /></AppLayout>} />
        <Route path="/app/verify" element={<AppLayout><Verify /></AppLayout>} />
        <Route path="/app/verification" element={<AppLayout><Verification /></AppLayout>} />
        <Route path="/app/bids" element={<AppLayout><div className="p-8 text-center">Meus Lances (Em breve)</div></AppLayout>} />
        <Route path="/app/history" element={<AppLayout><div className="p-8 text-center">Histórico (Em breve)</div></AppLayout>} />
        
        {/* Rotas Administrativas */}
        <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;