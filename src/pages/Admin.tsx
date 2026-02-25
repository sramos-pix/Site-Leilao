"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Gavel, LayoutDashboard, Package, Users, Settings, LogOut, CreditCard, MessageSquare, Bell } from "lucide-react";
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

  const [activeTab, setActiveTab] = useState<"dashboard" | "auctions" | "lots" | "users" | "settings" | "payments" | "chat" | "notifications">("dashboard");
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  
  // Usamos uma ref para acessar o valor atual da aba dentro do listener do Supabase
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    if (userIdParam) {
      setActiveTab("users");
    }
  }, [userIdParam]);

  // Atualiza a ref sempre que a aba muda e zera o contador se entrar no chat
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (activeTab === "chat") {
      setUnreadChatCount(0);
    }
  }, [activeTab]);

  // Listener para novas mensagens de suporte
  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: 'is_from_admin=eq.false' // Apenas mensagens enviadas por usuários
        },
        (payload) => {
          // Se não estiver na aba de chat, incrementa o contador e notifica
          if (activeTabRef.current !== 'chat') {
            setUnreadChatCount(prev => prev + 1);
            
            // Toca som de notificação de mensagem
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
              audio.volume = 0.5;
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                playPromise.catch(e => console.log("Áudio bloqueado pelo navegador", e));
              }
            } catch (err) {
              console.error("Erro ao tocar som", err);
            }

            // Mostra o alerta visual
            toast({
              title: "💬 Nova mensagem no chat!",
              description: "Um usuário acabou de enviar uma mensagem de suporte.",
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 flex">
        <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col sticky top-0 h-screen z-10">
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
              className={`w-full justify-start rounded-xl h-12 font-bold transition-all relative ${activeTab === "chat" ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <MessageSquare size={18} className="mr-3" /> Chat Suporte
              {unreadChatCount > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/50">
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