"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Verify = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Verificação de Conta</h1>
    </main>
    <Footer />
  </div>
);

export default Verify;