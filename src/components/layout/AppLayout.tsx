"use client";

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Gavel, LayoutDashboard, History, User, 
  LogOut, Bell, Menu, X, ShieldAlert, AlertCircle, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProfileAndNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserProfile(profile);

      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setNotifications(notifs || []);
    }
  };

  React.useEffect(() => {
    fetchProfileAndNotifications();

    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 5));
        toast({
          title: payload.new.title,
          description: payload.new.message,
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({ title: "Sessão encerrada", description: "Até logo!" });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/app' },
    { icon: Gavel, label: 'Meus Lances', path: '/app/bids' },
    { icon: History, label: 'Histórico', path: '/app/history' },
    { icon: User, label: 'Meu Perfil', path: '/app/profile' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {userProfile?.kyc_status === 'rejected' && (
        <div className="bg-red-600 text-white py-3 px-4 flex items-center justify-center gap-3 animate-pulse">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">Seu documento foi rejeitado. Por favor, envie um novo documento.</p>
          <Button variant="outline" size="sm" className="bg-white text-red-600 border-none hover:bg-slate-100 rounded-lg h-8" onClick={() => navigate('/app/verify')}>Reenviar Agora</Button>
        </div>
      )}

      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/app" className="flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded-lg text-white"><Gavel size={20} /></div>
              <span className="font-bold text-xl tracking-tight text-slate-900">AUTO BID</span>
            </Link>
            <Link to="/"><Button variant="ghost" className="hidden md:flex gap-2 text-slate-600 hover:text-orange-600 font-bold rounded-xl"><Home size={18} /> Início</Button></Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button variant="ghost" className={cn("gap-2 rounded-xl", location.pathname === item.path ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "text-slate-600")}>
                  <item.icon size={18} /> {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-slate-600 relative">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl shadow-xl border-none">
                <div className="p-3 border-b border-slate-50 mb-2"><h4 className="font-bold text-slate-900">Notificações</h4></div>
                {notifications.length > 0 ? notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start p-3 rounded-xl hover:bg-slate-50 cursor-default">
                    <span className="font-bold text-sm text-slate-900">{n.title}</span>
                    <span className="text-xs text-slate-500 leading-relaxed">{n.message}</span>
                  </DropdownMenuItem>
                )) : (
                  <div className="p-8 text-center text-slate-400 text-sm italic">Nenhuma notificação.</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-slate-600 hover:text-red-500"><LogOut size={20} /></Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</Button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b p-4 space-y-2">
          <Link to="/" onClick={() => setIsMenuOpen(false)}><Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-slate-600"><Home size={20} /> Início</Button></Link>
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className={cn("w-full justify-start gap-3 rounded-xl", location.pathname === item.path ? "bg-orange-50 text-orange-600" : "text-slate-600")}><item.icon size={20} /> {item.label}</Button>
            </Link>
          ))}
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default AppLayout;