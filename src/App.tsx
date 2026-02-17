"use client";

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/app/Dashboard';
import History from './pages/app/History';
import Profile from './pages/app/Profile';
import Verify from './pages/app/Verify';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import LotDetail from './pages/LotDetail';
import Vehicles from './pages/Vehicles';
import Auctions from './pages/Auctions';
import AuctionDetails from './pages/AuctionDetails';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import { Toaster } from '@/components/ui/toaster';
import AdminGuard from './components/admin/AdminGuard';

function App() {
  return (
    <>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetails />} />
        <Route path="/lots/:id" element={<LotDetail />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Rotas do Aplicativo (Usuário Logado) */}
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/history" element={<History />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/verify" element={<Verify />} />
        <Route path="/app/checkout/:id" element={<Checkout />} />
        
        {/* Rotas Administrativas - Protegidas pelo AdminGuard */}
        <Route 
          path="/admin" 
          element={
            <AdminGuard>
              <Admin />
            </AdminGuard>
          } 
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;