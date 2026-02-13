"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Gavel, Loader2, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Bem-vindo de volta!", description: "Login realizado com sucesso." });
      navigate('/app');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no login", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200')] opacity-20 bg-cover bg-center" />
        <div className="relative z-10 text-white max-w-md">
          <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/20">
            <Gavel size={32} />
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight">Acesse sua conta no AUTO BID</h1>
          <p className="text-slate-400 text-lg">Participe dos melhores leilões de veículos com segurança e transparência.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-orange-500 p-3 rounded-xl text-white"><Gavel size={32} /></div>
          </div>
          
          <div className="space-y-2">
            <Link to="/" className="text-sm font-bold text-orange-600 flex items-center gap-2 mb-4 hover:underline">
              <ArrowLeft size={16} /> Voltar para o início
            </Link>
            <h2 className="text-3xl font-black text-slate-900">Entrar</h2>
            <p className="text-slate-500">Insira suas credenciais para acessar o painel.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Senha</Label>
                <button type="button" className="text-xs font-bold text-orange-600 hover:underline">Esqueceu a senha?</button>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl" />
            </div>
            <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'ACESSAR CONTA'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Não tem uma conta? <Link to="/register" className="font-bold text-orange-600 hover:underline">Cadastre-se agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;