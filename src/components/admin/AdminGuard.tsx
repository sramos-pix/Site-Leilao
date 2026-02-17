"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const [status, setStatus] = useState<'loading' | 'unauthorized' | 'authorized'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setStatus('unauthorized');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // Permite acesso se for admin ou financeiro
      if (profile?.role === 'admin' || profile?.role === 'finance') {
        setStatus('authorized');
      } else {
        setStatus('unauthorized');
      }
    };

    checkAdminAccess();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-red-600 text-white text-center py-8">
            <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-4">
              <ShieldAlert size={32} />
            </div>
            <CardTitle className="text-2xl font-bold">Acesso Negado</CardTitle>
            <p className="text-red-100 text-sm mt-2">Você não tem permissão para acessar esta área.</p>
          </CardHeader>
          <CardContent className="p-8 text-center space-y-6">
            <p className="text-slate-600">Esta área é restrita a administradores e equipe financeira autorizada.</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/login')} className="w-full bg-slate-900 h-12 rounded-xl font-bold">
                FAZER LOGIN COMO ADMIN
              </Button>
              <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-slate-500">
                Voltar para o Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;