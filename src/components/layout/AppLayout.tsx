"use client";

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Gavel, LayoutDashboard, History, User, 
  LogOut, Bell, Menu, X, ShieldAlert, AlertCircle
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
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserProfile(data);
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
    { icon: LayoutDashboard, label: 'Painel', path: '/app' },
    { icon: Gavel, label: 'Meus Lances', path: '/app/bids' },
    { icon: History, label: 'Histórico', path: '/app/history' },
    { icon: User, label: 'Meu Perfil', path: '/app/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Alerta de Rejeição */}
      {userProfile?.kyc_status === 'rejected' && (
        <div className="bg-red-600 text-white py-3 px-4 flex items-center justify-center gap-3 animate-pulse">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">
            Seu documento foi rejeitado. Por favor, envie um novo documento para liberar seus lances.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white text-red-600 border-none hover:bg-slate-100 rounded-lg h-8"
            onClick={() => navigate('/app/verification')}
          >
            Reenviar Agora
          </Button>
        </div>
      )}

      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <Gavel size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">AUTO BID</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "gap-2 rounded-xl",
                    location.pathname === item.path ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "text-slate-600"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-600">
              <Bell size={20} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-slate-600 hover:text-red-500">
              <LogOut size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b p-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-3 rounded-xl",
                  location.pathname === item.path ? "bg-orange-50 text-orange-600" : "text-slate-600"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;