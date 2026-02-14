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
import Checkout from './pages/app/Checkout';
import Admin from './pages/Admin';
import LotDetail from './pages/LotDetail';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lots/:id" element={<LotDetail />} />
        
        {/* Rotas do Aplicativo (Usuário Logado) */}
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/history" element={<History />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/verify" element={<Verify />} />
        <Route path="/app/checkout/:id" element={<Checkout />} />
        
        {/* Rotas Administrativas */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;