"use client";

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LotDetail from './pages/LotDetail'; // Voltando para o original
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminAuctions from './pages/admin/AdminAuctions';
import AdminLots from './pages/admin/AdminLots';
import AdminBids from './pages/admin/AdminBids';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/lots/:id" element={<LotDetail />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="auctions" element={<AdminAuctions />} />
          <Route path="lots" element={<AdminLots />} />
          <Route path="bids" element={<AdminBids />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;