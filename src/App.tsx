"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LotDetails from './pages/LotDetails';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AppLayout from './components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/lots/:id" element={<LotDetails />} />
        
        {/* Rotas do Painel do Usuário */}
        <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/app/profile" element={<AppLayout><Profile /></AppLayout>} />
        <Route path="/app/bids" element={<AppLayout><div>Meus Lances (Em breve)</div></AppLayout>} />
        <Route path="/app/history" element={<AppLayout><div>Histórico (Em breve)</div></AppLayout>} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;