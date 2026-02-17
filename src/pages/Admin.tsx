"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Gavel, LayoutDashboard, Package, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminPayments from "@/components/admin/AdminPayments";
import AuctionManager from "@/components/admin/AuctionManager";
import LotManager from "@/components/admin/LotManager";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"dashboard" | "payments" | "auctions" | "lots">("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar simples de navegação */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <div className="mb-8">
          <div className="text-2xl font-bold">ADMIN</div>
        </div>
        <nav className="flex-1 space-y-2">
          <Button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full justify-start rounded-xl ${activeTab === "dashboard" ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <LayoutDashboard size={18} className="mr-2" /> Painel
          </Button>
          <Button
            onClick={() => setActiveTab("payments")}
            className={`w-full justify-start rounded-xl ${activeTab === "payments" ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <CreditCard size={18} className="mr-2" /> Pagamentos
          </Button>
          <Button
            onClick={() => setActiveTab("auctions")}
            className={`w-full justify-start rounded-xl ${activeTab === "auctions" ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Gavel size={18} className="mr-2" /> Leilões
          </Button>
          <Button
            onClick={() => setActiveTab("lots")}
            className={`w-full justify-start rounded-xl ${activeTab === "lots" ? "bg-orange-500 text-white" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Package size={18} className="mr-2" /> Lotes
          </Button>
        </nav>
        <div className="mt-auto pt-4">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start rounded-xl text-red-400 hover:text-red-600">
            <LogOut size={18} className="mr-2" /> Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "dashboard" && <AdminOverview />}
        {activeTab === "payments" && <AdminPayments />}
        {activeTab === "auctions" && <AuctionManager />}
        {activeTab === "lots" && <LotManager />}
      </main>
    </div>
  );
};

export default Admin;