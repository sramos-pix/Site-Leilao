"use client";

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Auctions from './pages/Auctions';
import AuctionDetails from './pages/AuctionDetails';
import LotDetails from './pages/LotDetails';
import Vehicles from './pages/Vehicles';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/app/Dashboard';
import Profile from './pages/app/Profile';
import VerifyAccount from './pages/app/VerifyAccount';
import Favorites from './pages/app/Favorites';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAuctions from './pages/admin/AdminAuctions';
import AdminLots from './pages/admin/AdminLots';
import AdminUsers from './pages/admin/AdminUsers';
import AdminKYC from './pages/admin/AdminKYC';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetails />} />
        <Route path="/lots/:id" element={<LotDetails />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* App Routes */}
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/verify" element={<VerifyAccount />} />
        <Route path="/app/favorites" element={<Favorites />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<Navigate to="/admin/auctions" replace />} />
          <Route path="auctions" element={<AdminAuctions />} />
          <Route path="lots" element={<AdminLots />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="kyc" element={<AdminKYC />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;