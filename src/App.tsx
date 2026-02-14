"use client";

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Auctions from './pages/Auctions';
import AuctionDetails from './pages/AuctionDetails';
import LotDetail from './pages/LotDetail';
import Vehicles from './pages/Vehicles';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/app/Dashboard';
import Profile from './pages/app/Profile';
import History from './pages/app/History';
import Verify from './pages/app/Verify';
import Checkout from './pages/app/Checkout';
import Admin from './pages/Admin';
import AdminGuard from './components/admin/AdminGuard';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from './components/ui/toaster';

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
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App Routes (User) */}
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/history" element={<History />} />
        <Route path="/app/verify" element={<Verify />} />
        <Route path="/app/checkout/:id" element={<Checkout />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;