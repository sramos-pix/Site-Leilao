"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Wrench } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const MaintenanceGuard = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
  }, [location.pathname]);

  const checkStatus = async () => {
    try {
      const { data: settings } = await supabase
        .from('platform_settings')
        .select('maintenance_mode')
        .eq('id', 1)
        .single();

      const maintenance = settings?.maintenance_mode || false;
      setIsMaintenance(maintenance);

      if (maintenance) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          setIsAdmin(profile?.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar manutenção:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Permite acesso à página de login para que os admins possam entrar e desativar
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  if (isMaintenance && !isAdmin && !isAuthRoute) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Wrench size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Site em Manutenção</h1>
        <p className="text-slate-500 max-w-md mb-8 text-lg leading-relaxed">
          Estamos realizando algumas atualizações no sistema para melhorar sua experiência. Voltaremos em breve!
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-slate-400 hover:text-orange-500 transition-colors"
        >
          Acesso Administrativo
        </button>
      </div>
    );
  }

  return <>{children}</>;
};