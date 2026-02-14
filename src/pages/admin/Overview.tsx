"use client";

import React from 'react';
import Navbar from '@/components/Navbar';

const AdminOverview = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Painel Administrativo</h1>
    </main>
  </div>
);

export default AdminOverview;