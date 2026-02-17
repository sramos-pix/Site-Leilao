"use client";

import React, { useState, useEffect } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const adminAuth = localStorage.getItem('admin_auth');
      
      // Só permite acesso se estiver logado no Supabase E tiver passado pela senha do admin
      if (session && adminAuth === 'true') {
        setIsAuthenticated(true);
      } else if (!session) {
        // Se não houver sessão no Supabase, limpa o auth do admin e manda pro login
        localStorage.removeItem('admin_auth');
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkSession();

    // Escuta mudanças na autenticação (como o logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('admin_auth');
        setIsAuthenticated(false);
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode manter sua senha simples ou validar contra o banco
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Credenciais administrativas inválidas.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-orange-500 text-white text-center py-8">
            <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-4">
              <Lock size={32} />
            </div>
            <CardTitle className="text-2xl font-bold">Acesso Restrito</CardTitle>
            <p className="text-orange-100 text-sm mt-2">Painel de Controle AutoBid</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="user">Usuário</Label>
                <Input 
                  id="user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass">Senha</Label>
                <Input 
                  id="pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl"
                />
              </div>
              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl font-bold">
                ENTRAR NO PAINEL
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;