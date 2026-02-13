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
    { name: 'Como Funciona', href: '/#how-it-works' },
    { name: 'Contato', href: '/#contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      if (location.pathname === '/') {
        e.preventDefault();
        const id = href.replace('/#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      setIsOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded-lg text-white">
                <Gavel size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                AUTO<span className="text-orange-500">BID</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  "text-sm font-bold transition-colors hover:text-orange-500",
                  isActive(item.href) ? "text-orange-500" : "text-slate-600"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 ml-4 border-l pl-8">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/app">
                    <Button variant="ghost" className="text-slate-900 gap-2 font-black hover:bg-slate-50 rounded-xl">
                      <LayoutDashboard size={18} /> Painel
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500 rounded-full">
                    <LogOut size={18} />
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="text-slate-900 font-black hover:bg-slate-50 rounded-xl">Entrar</Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 font-black shadow-lg shadow-orange-100 transition-all">
                      Cadastrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-xl">
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b px-4 pt-2 pb-8 space-y-1 shadow-xl">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={(e) => {
                handleNavClick(e, item.href);
                setIsOpen(false);
              }}
              className={cn(
                "block px-4 py-3 rounded-xl text-base font-bold",
                isActive(item.href) ? "bg-orange-50 text-orange-600" : "text-slate-600"
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-6 flex flex-col gap-3 px-2">
            {user ? (
              <Link to="/app" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-slate-900 text-white font-black h-12 rounded-xl">Meu Painel</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full font-black h-12 rounded-xl border-slate-200">Entrar</Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-orange-500 text-white font-black h-12 rounded-xl shadow-lg shadow-orange-100">Cadastrar</Button>
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