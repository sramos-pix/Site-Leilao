import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Gavel, User, Menu, X, LogIn, Settings, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  
  // Verifica se as chaves do banco existem
  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Leilões', href: '/auctions' },
    { name: 'Admin', href: '/admin', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      {!isConfigured && (
        <div className="bg-red-500 text-white text-xs py-2 text-center font-bold flex items-center justify-center gap-2">
          <AlertTriangle size={14} />
          BANCO DE DADOS NÃO CONFIGURADO. CLIQUE EM "ADD SUPABASE" E DEPOIS EM "REBUILD".
        </div>
      )}
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

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-orange-500 flex items-center gap-1",
                  isActive(item.href) ? "text-orange-500" : "text-slate-600"
                )}
              >
                {item.icon && <item.icon size={14} />}
                {item.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 ml-4 border-l pl-8">
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-600">Entrar</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;