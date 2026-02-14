"use client";

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Auctions from './pages/Auctions';
import AuctionDetails from './pages/AuctionDetails';
import LotDetail from './pages/LotDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import History from './pages/History';
import Verify from './pages/Verify';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import AdminGuard from './components/admin/AdminGuard';
import AppLayout from './components/layout/AppLayout';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetails />} />
        <Route path="/lots/:id" element={<LotDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected App Routes */}
        <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/app/profile" element={<AppLayout><Profile /></AppLayout>} />
        <Route path="/app/history" element={<AppLayout><History /></AppLayout>} />
        <Route path="/app/verify" element={<AppLayout><Verify /></AppLayout>} />
        <Route path="/app/checkout/:id" element={<AppLayout><Checkout /></AppLayout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;