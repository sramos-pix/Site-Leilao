"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LayoutDashboard, Car, History, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meu Painel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Meus Lances', icon: History, href: '/app/history', color: 'bg-blue-500' },
            { label: 'Perfil', icon: User, href: '/app/profile', color: 'bg-orange-500' },
            { label: 'Verificação', icon: Car, href: '/app/verify', color: 'bg-emerald-500' },
            { label: 'Início', icon: LayoutDashboard, href: '/', color: 'bg-slate-900' },
          ].map((item) => (
            <Link key={item.label} to={item.href} className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
              <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-900">{item.label}</h3>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;