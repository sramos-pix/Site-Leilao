"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import LotDetails from './pages/LotDetails';
import Checkout from './pages/Checkout'; // Importando o novo componente
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/lot/:id" element={<LotDetails />} />
        <Route path="/checkout/:lotId" element={<Checkout />} /> {/* Nova rota */}
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;