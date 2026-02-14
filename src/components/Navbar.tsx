"use client";

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gavel, Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react';
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
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-orange-500 p-2 rounded-2xl text-white shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                <Gavel size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">
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
                className={cn(
                  "text-sm font-black transition-all hover:text-orange-500 uppercase tracking-widest",
                  isActive(item.href) ? "text-orange-500" : "text-slate-500"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 ml-4 border-l pl-8 border-slate-100">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/app">
                    <Button variant="ghost" className="text-slate-900 gap-2 font-black hover:bg-slate-50 rounded-2xl h-12 px-6">
                      <LayoutDashboard size={18} /> PAINEL
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50">
                    <LogOut size={18} />
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-slate-900 font-black hover:bg-slate-50 rounded-2xl h-12 px-6">ENTRAR</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 h-12 font-black shadow-xl shadow-orange-100 transition-all hover:-translate-y-0.5">
                      CADASTRAR
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-2xl w-12 h-12 bg-slate-50">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b px-6 pt-4 pb-10 space-y-2 shadow-2xl animate-in slide-in-from-top duration-300">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-6 py-4 rounded-2xl text-lg font-black uppercase tracking-widest",
                isActive(item.href) ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-6 flex flex-col gap-4">
            {user ? (
              <>
                <Link to="/app" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-slate-900 text-white font-black h-14 rounded-2xl shadow-xl">MEU PAINEL</Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="w-full font-black h-14 rounded-2xl border-red-100 text-red-500">SAIR</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full font-black h-14 rounded-2xl border-slate-200">ENTRAR</Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-orange-500 text-white font-black h-14 rounded-2xl shadow-xl shadow-orange-100">CADASTRAR</Button>
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