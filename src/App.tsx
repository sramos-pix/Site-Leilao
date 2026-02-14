"use client";

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/app/Dashboard';
import Admin from './pages/Admin';
import LotDetail from './pages/LotDetail';
import Checkout from './pages/Checkout';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/lots/:id" element={<LotDetail />} />
        <Route path="/checkout/:lotId" element={<Checkout />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;