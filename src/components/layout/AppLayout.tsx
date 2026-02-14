"use client";

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Gavel, LayoutDashboard, User, 
  LogOut, Bell, Menu, X, AlertCircle, Home, Trophy
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
      
      setUserProfile(profile || { 
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        kyc_status: 'waiting'
      });

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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({ title: "Sessão encerrada", description: "Até logo!" });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/app' },
    { icon: Trophy, label: 'Meus Arremates', path: '/app/history' },
    { icon: User, label: 'Meu Perfil', path: '/app/profile' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {userProfile?.kyc_status === 'rejected' && (
        <div className="bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-3">
          <AlertCircle size={16} />
          <p className="text-xs font-bold">Seu documento foi rejeitado. Por favor, envie um novo documento.</p>
          <Button variant="outline" size="sm" className="bg-white text-red-600 border-none hover:bg-slate-100 rounded-md h-7 text-[10px]" onClick={() => navigate('/app/verify')}>Reenviar Agora</Button>
        </div>
      )}

      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app" className="flex items-center gap-2">
              <div className="bg-orange-500 p-1 rounded-md text-white"><Gavel size={16} /></div>
              <span className="font-bold text-lg tracking-tight text-slate-900">AUTO BID</span>
            </Link>
            <Link to="/"><Button variant="ghost" className="hidden md:flex gap-2 text-slate-600 hover:text-orange-600 font-bold rounded-lg h-9 text-xs"><Home size={16} /> Início</Button></Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button variant="ghost" className={cn("gap-2 rounded-lg font-bold h-9 text-xs", location.pathname === item.path ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "text-slate-600")}>
                  <item.icon size={16} /> {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-slate-600 relative h-9 w-9">
                  <Bell size={18} />
                  {unreadCount > 0 && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-1 rounded-xl shadow-lg border-none">
                <div className="p-2 border-b border-slate-50 mb-1"><h4 className="font-bold text-sm text-slate-900">Notificações</h4></div>
                {notifications.length > 0 ? notifications.map((n) => (
                  <DropdownMenuItem 
                    key={n.id} 
                    className="flex flex-col items-start p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate('/app/history')}
                  >
                    <span className="font-bold text-xs text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-500 leading-tight">{n.message}</span>
                  </DropdownMenuItem>
                )) : (
                  <div className="p-6 text-center text-slate-400 text-xs italic">Nenhuma notificação.</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-slate-600 hover:text-red-500 h-9 w-9"><LogOut size={18} /></Button>
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={20} /> : <Menu size={20} />}</Button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b p-3 space-y-1">
          <Link to="/" onClick={() => setIsMenuOpen(false)}><Button variant="ghost" className="w-full justify-start gap-3 rounded-lg text-slate-600 h-10 text-sm"><Home size={18} /> Início</Button></Link>
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className={cn("w-full justify-start gap-3 rounded-lg font-bold h-10 text-sm", location.pathname === item.path ? "bg-orange-50 text-orange-600" : "text-slate-600")}><item.icon size={18} /> {item.label}</Button>
            </Link>
          ))}
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default AppLayout;