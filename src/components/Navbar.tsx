"use client";

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gavel, Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Leilões', href: '/auctions' },
    { name: 'Veículos', href: '/vehicles' },
    { name: 'Como Funciona', href: '/how-it-works' },
    { name: 'Contato', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Gavel className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                AUTO<span className="text-orange-500">BID</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-bold transition-colors hover:text-orange-500",
                  isActive(item.href) ? "text-orange-500" : "text-slate-600"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 ml-4 border-l pl-6">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/app">
                    <Button variant="ghost" className="text-slate-600 gap-2 font-bold">
                      <LayoutDashboard size={18} /> Painel
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                    <LogOut size={18} />
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="text-slate-600 font-bold">Entrar</Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 font-bold">Cadastrar</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b px-4 pt-2 pb-6 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md text-base font-bold",
                isActive(item.href) ? "bg-orange-50 text-orange-600" : "text-slate-600"
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            {user ? (
              <Link to="/app" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-slate-900 text-white font-bold">Meu Painel</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full font-bold">Entrar</Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-orange-500 text-white font-bold">Cadastrar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;