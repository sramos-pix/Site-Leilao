"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, User, ShieldCheck, AlertCircle, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta à plataforma AutoBid."
        });
        navigate('/app/dashboard');
      }
    } catch (error: any) {
      let msg = error.message || "Erro ao realizar login.";
      if (msg.toLowerCase().includes('invalid login credentials')) {
        msg = "E-mail ou senha incorretos. Verifique seus dados e tente novamente.";
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        msg = "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // Usando window.location.origin para garantir que volte para o site atual
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      toast({
        variant: "destructive",
        title: "Erro no login com Google",
        description: "Não foi possível conectar com sua conta Google. Tente novamente."
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg shadow-orange-200">
            <User size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            Bem-vindo de Volta
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Faça login para acessar sua conta e dar lances.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          {errorMessage && (
            <Alert variant="destructive" className="mb-6 rounded-xl bg-red-50 border-red-100 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full h-12 mb-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                <Chrome size={20} className="text-blue-600" />
                Entrar com Google
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">ou continue com e-mail</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                type="email" 
                placeholder="Seu e-mail" 
                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Sua senha" 
                className="pl-10 pr-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Entrar na Conta"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-slate-50 p-6 flex flex-col space-y-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 text-center font-medium">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-orange-600 font-bold hover:underline">Cadastre-se agora</Link>
          </p>
          <Link to="/" className="text-xs text-slate-400 text-center hover:text-slate-600 flex items-center justify-center gap-1">
            Voltar para o início <ArrowRight size={12} />
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;