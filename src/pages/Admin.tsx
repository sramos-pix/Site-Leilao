"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Gavel, LayoutDashboard, Package, Users, Settings, LogOut, CreditCard, MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import AdminOverview from "@/components/admin/AdminOverview";
import AuctionManager from "@/components/admin/AuctionManager";
import LotManager from "@/components/admin/LotManager";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminChat from "@/components/admin/AdminChat";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminGuard from "@/components/admin/AdminGuard";

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<"dashboard" | "auctions" | "lots" | "users" | "settings" | "payments" | "chat" | "notifications">("dashboard");

  useEffect(() => {
    if (userIdParam) {
      setActiveTab("users");
    }
  }, [userIdParam]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 flex">
        <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col sticky top-0 h-screen">
          <div className="mb-8 px-2">
            <div className="text-2xl font-black tracking-tighter text-orange-500">AUTO BID</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Painel de Controle</div>
          </div>
          
          <nav className="flex-1 space-y-1">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${activeTab === "dashboard" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <LayoutDashboard size={18} className="mr-3" /> Dashboard
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setActiveTab("chat")}
              className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${activeTab === "chat" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <MessageSquare size={18} className="mr-3" /> Chat Suporte
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("notifications")}
              className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${activeTab === "notifications" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Bell size={18} className="mr-3" /> Notificações
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("payments")}
              className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${activeTab === "payments" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <CreditCard size={18} className="mr-3" /> Pagamentos
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("auctions")}
              className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${activeTab === "auctions" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Gavel size={18} className="mr-3" /> Leilões
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("lots")}
              className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${activeTab === "lots" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Package size={18} className="mr-3" /> Veículos
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("users")}
              className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${activeTab === "users" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Users size={18} className="mr-3" /> Usuários
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("settings")}
              className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${activeTab === "settings" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Settings size={18} className="mr-3" /> Configurações
            </Button>
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/10 font-bold">
              <LogOut size={18} className="mr-3" /> Sair do Painel
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && <AdminOverview />}
            {activeTab === "chat" && <AdminChat />}
            {activeTab === "notifications" && <AdminNotifications />}
            {activeTab === "payments" && <AdminPayments />}
            {activeTab === "auctions" && <AuctionManager />}
            {activeTab === "lots" && <LotManager />}
            {activeTab === "users" && <AdminUsers />}
            {activeTab === "settings" && <AdminSettings />}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
};

export default Admin;