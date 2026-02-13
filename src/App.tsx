"use client";

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Auctions from './pages/Auctions';
import Vehicles from './pages/Vehicles';
import LotDetail from './pages/LotDetail';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Verify from './pages/Verify';
import History from './pages/History';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import AppLayout from './components/layout/AppLayout';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/lots/:id" element={<LotDetail />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        
        {/* Rotas do App com Layout */}
        <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/app/profile" element={<AppLayout><Profile /></AppLayout>} />
        <Route path="/app/verify" element={<AppLayout><Verify /></AppLayout>} />
        <Route path="/app/history" element={<AppLayout><History /></AppLayout>} />
        <Route path="/app/checkout/:id" element={<AppLayout><Checkout /></AppLayout>} />
        
        {/* Rota Admin */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;