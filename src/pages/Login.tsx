"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, User, ShieldCheck, AlertCircle } from 'lucide-react';

// Logo oficial do Google (SVG inline)
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);
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
          redirectTo: `${window.location.origin}/auth/callback`,
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
                <GoogleLogo />
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
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-orange-500 hover:text-orange-600 font-semibold hover:underline">
                Esqueceu a senha?
              </Link>
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