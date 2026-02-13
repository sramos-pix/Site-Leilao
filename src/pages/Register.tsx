"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Gavel, Loader2, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, full_name: fullName, email }]);
        
        if (profileError) console.error("Erro ao criar perfil:", profileError);
      }

      toast({ title: "Conta criada!", description: "Verifique seu e-mail para confirmar o cadastro." });
      navigate('/login');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no cadastro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-orange-500 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 text-white max-w-md">
          <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <Gavel size={32} className="text-orange-500" />
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight">Comece a dar lances hoje mesmo</h1>
          <p className="text-orange-100 text-lg">Crie sua conta em poucos segundos e tenha acesso exclusivo aos melhores lotes do mercado.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Link to="/" className="text-sm font-bold text-orange-600 flex items-center gap-2 mb-4 hover:underline">
              <ArrowLeft size={16} /> Voltar para o início
            </Link>
            <h2 className="text-3xl font-black text-slate-900">Criar Conta</h2>
            <p className="text-slate-500">Preencha os dados abaixo para começar.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" placeholder="Seu nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl" />
            </div>
            <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'CRIAR MINHA CONTA'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Já tem uma conta? <Link to="/login" className="font-bold text-orange-600 hover:underline">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;