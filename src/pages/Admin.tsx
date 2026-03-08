"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Gavel, LayoutDashboard, Package, Users, Settings, LogOut, CreditCard, MessageSquare, Bell, PanelLeftClose, PanelLeftOpen, ChevronRight } from "lucide-react";
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
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 text-white flex flex-col sticky top-0 h-screen z-10 transition-all duration-300 overflow-hidden`}>
          {/* Logo */}
          <div className={`${sidebarOpen ? 'p-6 mb-2' : 'py-4 px-2 mb-2'}`}>
            {sidebarOpen ? (
              <div className="px-2">
                <div className="text-2xl font-black tracking-tighter text-orange-500">AUTO BID</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Painel de Controle</div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="bg-orange-500 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Gavel size={18} className="text-white" />
                </div>
              </div>
            )}
          </div>

          <nav className={`flex-1 space-y-1 ${sidebarOpen ? 'px-6' : 'px-2'}`}>
            <Button
              title="Dashboard"
              variant="ghost"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-0'} rounded-xl h-12 font-bold transition-all ${activeTab === "dashboard" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <LayoutDashboard size={18} className={sidebarOpen ? "mr-3" : ""} />
              {sidebarOpen && "Dashboard"}
            </Button>

            <Button
              title="Chat Suporte"
              variant="ghost"
              onClick={() => setActiveTab("chat")}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-0'} rounded-xl h-12 font-bold transition-all relative ${activeTab === "chat" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <MessageSquare size={18} className={sidebarOpen ? "mr-3" : ""} />
              {sidebarOpen && "Chat Suporte"}
              {unreadChatCount > 0 && (
                <span className={`${sidebarOpen ? 'absolute right-3' : 'absolute -top-1 -right-1'} top-1/2 ${sidebarOpen ? '-translate-y-1/2' : ''} bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce shadow-lg shadow-red-500/50`}>
                  {unreadChatCount}
                </span>
              )}
            </Button>

            <Button
              title="Notificações"
              variant="ghost"
              onClick={() => setActiveTab("notifications")}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-0'} rounded-xl h-12 font-bold transition-all ${activeTab === "notifications" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Bell size={18} className={sidebarOpen ? "mr-3" : ""} />
              {sidebarOpen && "Notificações"}
            </Button>

            <Button
              title="Pagamentos"
              variant="ghost"
              onClick={() => setActiveTab("payments")}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-0'} rounded-xl h-12 font-bold transition-all ${activeTab === "payments" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <CreditCard size={18} className={sidebarOpen ? "mr-3" : ""} />
              {sidebarOpen && "Pagamentos"}
            </Button>

            <Button
              title="Leilões"
              variant="ghost"
              onClick={() => setActiveTab("auctions")}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-0'} rounded-xl h-12 font-bold transition-all ${activeTab === "auctions" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Gavel size={18} className={sidebarOpen ? "mr-3" : ""} />
              {sidebarOpen && "Leilões"}
            </Button>

            <Button
              title="Veículos"
              variant="ghost"
              onClick={() => setActiveTab("lots")}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-0'} rounded-xl h-12 font-bold transition-all ${activeTab === "lots" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Package size={18} className={sidebarOpen ? "mr-3" : ""} />
              {sidebarOpen && "Veículos"}
            </Button>

            <Button
              title="Usuários"
              variant="ghost"
              onClick={() => setActiveTab("users")}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-0'} rounded-xl h-12 font-bold transition-all ${activeTab === "users" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Users size={18} className={sidebarOpen ? "mr-3" : ""} />
              {sidebarOpen && "Usuários"}
            </Button>

            <Button
              title="Configurações"
              variant="ghost"
              onClick={() => setActiveTab("settings")}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-0'} rounded-xl h-12 font-bold transition-all ${activeTab === "settings" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Settings size={18} className={sidebarOpen ? "mr-3" : ""} />
              {sidebarOpen && "Configurações"}
            </Button>
          </nav>

          <div className={`mt-auto pt-4 border-t border-slate-800 ${sidebarOpen ? 'px-6 pb-6' : 'px-2 pb-4'}`}>
            <Button
              title="Sair do Painel"
              variant="ghost"
              onClick={handleLogout}
              className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-0'} rounded-xl text-red-400 hover:text-red-500 hover:bg-red-500/10 font-bold`}
            >
              <LogOut size={18} className={sidebarOpen ? "mr-3" : ""} />
              {sidebarOpen && "Sair do Painel"}
            </Button>
          </div>
        </aside>

        <main className={`flex-1 overflow-y-auto ${activeTab === "settings" ? "" : "p-10"}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`fixed top-4 ${sidebarOpen ? 'left-[17rem]' : 'left-[4.5rem]'} z-20 bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-9 w-9 p-0 transition-all duration-300 shadow-lg`}
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