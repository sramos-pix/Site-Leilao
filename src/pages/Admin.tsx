"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Gavel, LayoutDashboard, Package, Users, Settings, LogOut, CreditCard, MessageSquare, Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<"dashboard" | "auctions" | "lots" | "users" | "settings" | "payments" | "chat" | "notifications">(() => {
    const savedTab = localStorage.getItem('adminActiveTab');
    return (savedTab as any) || "dashboard";
  });
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    if (userIdParam) {
      setActiveTab("users");
    }
  }, [userIdParam]);

  useEffect(() => {
    activeTabRef.current = activeTab;
    localStorage.setItem('adminActiveTab', activeTab);
    if (activeTab === "chat") {
      setUnreadChatCount(0);
    }
  }, [activeTab]);

  // Listener para novas mensagens de suporte
  useEffect(() => {
    console.log("[Admin] Iniciando monitoramento de mensagens em tempo real...");
    
    const channel = supabase
      .channel('admin_support_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages'
        },
        (payload) => {
          console.log("[Admin] Evento Realtime recebido:", payload);
          
          const newMessage = payload.new;
          
          // Só notifica se:
          // 1. Não for uma mensagem enviada pelo próprio admin
          // 2. O admin não estiver com a aba de chat aberta no momento
          if (!newMessage.is_from_admin && activeTabRef.current !== 'chat') {
            console.log("[Admin] Notificando nova mensagem de usuário...");
            
            setUnreadChatCount(prev => prev + 1);
            
            // Tenta tocar o som (requer interação prévia do usuário com a página)
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
            audio.volume = 0.6;
            audio.play().catch(err => {
              console.warn("[Admin] Áudio bloqueado pelo navegador. Clique na página para habilitar sons.", err);
            });

            // Alerta visual persistente
            toast({
              title: "💬 Novo Chat de Suporte",
              description: "Um cliente enviou uma mensagem. Clique para responder.",
              duration: 10000,
              variant: "default",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("[Admin] Status da conexão Realtime:", status);
      });

    return () => {
      console.log("[Admin] Encerrando monitoramento de mensagens.");
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 flex">
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} bg-slate-900 text-white p-6 flex flex-col sticky top-0 h-screen z-10 transition-all duration-300 ${!sidebarOpen && 'p-0'}`}>
          <div className={`mb-8 px-2 ${!sidebarOpen && 'hidden'}`}>
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
              className={`w-full justify-start rounded-xl h-12 font-bold transition-all relative ${activeTab === "chat" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <MessageSquare size={18} className="mr-3" /> Chat Suporte
              {unreadChatCount > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-lg shadow-red-500/50">
                  {unreadChatCount}
                </span>
              )}
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

        <main className={`flex-1 overflow-y-auto ${activeTab === "settings" ? "" : "p-10"}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`fixed top-4 ${sidebarOpen ? 'left-[17rem]' : 'left-4'} z-20 bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-9 w-9 p-0 transition-all duration-300 shadow-lg`}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </Button>
          <div className={activeTab === "settings" ? "h-full" : "max-w-7xl mx-auto"}>
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