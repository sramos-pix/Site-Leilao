"use client";

import React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Gavel, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const authSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  fullName: z.string().min(3, 'Nome muito curto').optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    }
  });

  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Tentativa manual de criar perfil caso a trigger falhe
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              full_name: data.fullName,
              email: data.email,
            });
          
          if (profileError) console.warn("Aviso: Perfil não pôde ser criado manualmente, mas o usuário foi registrado.", profileError);
        }

        toast({
          title: "Verifique seu e-mail",
          description: "Enviamos um link de confirmação para " + data.email,
        });
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (signInError) throw signInError;

        toast({
          title: "Bem-vindo!",
          description: "Login realizado com sucesso.",
        });
        navigate('/app');
      }
    } catch (error: any) {
      console.error("Erro de Auth:", error);
      toast({
        variant: "destructive",
        title: "Falha na operação",
        description: error.message || "Ocorreu um erro inesperado. Verifique suas credenciais.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-200">
            <Gavel className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {mode === 'signup' ? 'Crie sua conta' : 'Acesse sua conta'}
          </h1>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-0">
            <Tabs value={mode} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <Link to="/auth?mode=login" className="w-full">
                  <TabsTrigger value="login" className="w-full">Login</TabsTrigger>
                </Link>
                <Link to="/auth?mode=signup" className="w-full">
                  <TabsTrigger value="signup" className="w-full">Cadastro</TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="fullName" 
                      placeholder="Seu nome completo" 
                      className="pl-10"
                      {...register('fullName')}
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-xl text-lg font-semibold mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  mode === 'signup' ? 'Criar Conta' : 'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;