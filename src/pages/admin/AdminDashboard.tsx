"use client";

import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Gavel, Car, Users, ShieldCheck, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
  const location = useLocation();
  
  const menuItems = [
    { label: 'Leilões', path: '/admin/auctions', icon: Gavel },
    { label: 'Lotes', path: '/admin/lots', icon: Car },
    { label: 'Usuários', path: '/admin/users', icon: Users },
    { label: 'KYC', path: '/admin/kyc', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-tighter text-orange-500">AUTOBID <span className="text-white/50 text-xs block font-medium tracking-normal">ADMIN PANEL</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                location.pathname === item.path ? "bg-orange-500 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white font-bold">
            <LogOut size={20} /> Sair do Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;