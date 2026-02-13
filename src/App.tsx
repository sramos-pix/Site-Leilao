"use client";

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Auctions from './pages/Auctions';
import LotDetail from './pages/LotDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Verify from './pages/Verify';
import History from './pages/History';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import AppLayout from './components/layout/AppLayout';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/lots/:id" element={<LotDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
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