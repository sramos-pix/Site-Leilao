"use client";

import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Gavel, Car, Users, Settings, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Gavel, label: 'Leilões', path: '/admin/auctions' },
    { icon: Car, label: 'Veículos', path: '/admin/lots' },
    { icon: Users, label: 'Usuários', path: '/admin/users' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 space-y-8">
        <div className="font-black text-2xl text-orange-600">ADMIN</div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                location.pathname === item.path ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;