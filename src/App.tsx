"use client";

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LotDetail from './pages/LotDetail';
import Admin from './pages/Admin';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/lots/:id" element={<LotDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;