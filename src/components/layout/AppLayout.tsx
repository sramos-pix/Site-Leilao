"use client";

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Gavel, LayoutDashboard, User, 
  LogOut, Bell, Menu, X, Home, Heart, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProfile = async () => {
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
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({ title: "Sessão encerrada", description: "Até logo!" });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/app/dashboard' },
    { icon: Trophy, label: 'Meus Arremates', path: '/app/wins' },
    { icon: Heart, label: 'Favoritos', path: '/app/favorites' },
    { icon: User, label: 'Meu Perfil', path: '/app/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app/dashboard" className="flex items-center gap-2">
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