"use client";

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gavel, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-orange-500 p-1.5 rounded-xl text-white shadow-md shadow-orange-100 group-hover:scale-105 transition-transform">
                <Gavel size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Auto<span className="text-orange-500">Bid</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:text-orange-500",
                    isActive(item.href) ? "text-orange-500 bg-orange-50/50" : "text-slate-600"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-3 ml-4 border-l pl-6 border-slate-200">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/app/dashboard">
                    <Button variant="ghost" size="sm" className="text-slate-700 gap-2 font-semibold hover:bg-slate-100 rounded-xl">
                      <LayoutDashboard size={16} /> Painel
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50">
                    <LogOut size={16} />
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-slate-700 font-semibold hover:bg-slate-100 rounded-xl px-4">Entrar</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-5 font-semibold shadow-sm transition-all active:scale-95">
                      Cadastrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-xl w-10 h-10">
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b px-4 pt-2 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top duration-200">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-4 py-3 rounded-xl text-base font-medium",
                isActive(item.href) ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2 px-2">
            {user ? (
              <>
                <Link to="/app/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-slate-900 text-white font-semibold h-11 rounded-xl">Meu Painel</Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="w-full font-semibold h-11 rounded-xl border-slate-200 text-red-500">Sair</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full font-semibold h-11 rounded-xl border-slate-200">Entrar</Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-orange-500 text-white font-semibold h-11 rounded-xl shadow-md shadow-orange-100">Cadastrar</Button>
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