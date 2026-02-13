"use client";

import React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Gavel, Mail, Lock, User, Phone, MapPin, ShieldCheck, Loader2, FileText, AlertCircle, Search, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { validateCPF } from '@/lib/validations';

const authSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  fullName: z.string().min(3, 'Nome muito curto').optional(),
  phone: z.string().min(10, 'Telefone inválido').optional(),
  cep: z.string().min(8, 'CEP inválido').optional(),
  address: z.string().min(5, 'Endereço obrigatório').optional(),
  number: z.string().min(1, 'Número obrigatório').optional(),
  complement: z.string().optional(),
  city: z.string().min(2, 'Cidade obrigatória').optional(),
  state: z.string().length(2, 'UF (2 letras)').optional(),
  documentId: z.string().refine((val) => {
    if (!val) return true;
    return validateCPF(val);
  }, {
    message: "CPF inválido ou inexistente",
  }).optional(),
}).refine((data) => {
  if (data.password && data.confirmPassword !== undefined) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSearchingCep, setIsSearchingCep] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showResetOption, setShowResetOption] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setIsSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        toast({ variant: "destructive", title: "CEP não encontrado" });
        return;
      }
      setValue('address', data.logradouro);
      setValue('city', data.localidade);
      setValue('state', data.uf);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao buscar CEP" });
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleResetPassword = async () => {
    const email = getValues('email');
    if (!email) {
      toast({ variant: "destructive", title: "E-mail necessário", description: "Digite seu e-mail para recuperar a senha." });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=update-password`,
      });
      if (error) throw error;
      
      toast({ 
        title: "E-mail enviado!", 
        description: "Verifique sua caixa de entrada para redefinir sua senha." 
      });
      setShowResetOption(false);
      setErrorMessage(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setShowResetOption(false);
    
    try {
      if (mode === 'signup') {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password || '',
          options: { data: { full_name: data.fullName } }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setErrorMessage("Este e-mail já está cadastrado. Tente fazer login.");
            setShowResetOption(true);
            return;
          }
          throw signUpError;
        }

        if (authData.user) {
          await supabase.from('profiles').upsert({
            id: authData.user.id,
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            number: data.number,
            complement: data.complement,
            city: data.city,
            state: data.state,
            document_id: data.documentId,
            kyc_status: null
          });
        }

        toast({ title: "Cadastro realizado!", description: "Bem-vindo à plataforma." });
        navigate('/app');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password || '',
        });
        
        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setErrorMessage("E-mail ou senha incorretos.");
            setShowResetOption(true);
            return;
          }
          throw signInError;
        }
        
        toast({ title: "Bem-vindo de volta!", description: "Login realizado com sucesso." });
        navigate('/app');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-200">
            <Gavel className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {mode === 'signup' ? 'Cadastro de Licitante' : 'Acesse sua conta'}
          </h1>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
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
            {errorMessage && (
              <div className="space-y-4 mb-6">
                <Alert variant="destructive" className="rounded-2xl bg-red-50 border-red-100 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
                
                {showResetOption && (
                  <Button 
                    variant="outline" 
                    onClick={handleResetPassword}
                    className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl flex items-center gap-2 py-6"
                  >
                    <KeyRound size={18} />
                    Esqueci minha senha / Redefinir Senha
                  </Button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <User size={18} className="text-orange-500" /> Dados de Acesso
                  </h3>
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input {...register('fullName')} placeholder="João Silva" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input type="email" {...register('email')} placeholder="seu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input type="password" {...register('password')} placeholder="••••••••" />
                    {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                  </div>
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label>Confirmar Senha</Label>
                      <Input type="password" {...register('confirmPassword')} placeholder="••••••••" />
                      {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                    </div>
                  )}
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input {...register('documentId')} placeholder="000.000.000-00" />
                      {errors.documentId && <p className="text-xs text-red-500">{errors.documentId.message}</p>}
                    </div>
                  )}
                </div>

                {mode === 'signup' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <MapPin size={18} className="text-orange-500" /> Endereço e Contato
                    </h3>
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <div className="relative">
                        <Input {...register('cep')} placeholder="00000-000" onBlur={handleCepBlur} />
                        {isSearchingCep && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Rua / Logradouro</Label>
                      <Input {...register('address')} placeholder="Ex: Av. Paulista" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Número</Label>
                        <Input {...register('number')} placeholder="123" />
                      </div>
                      <div className="space-y-2">
                        <Label>Complemento</Label>
                        <Input {...register('complement')} placeholder="Apto 10" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input {...register('city')} placeholder="São Paulo" />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado (UF)</Label>
                        <Input {...register('state')} placeholder="SP" maxLength={2} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input {...register('phone')} placeholder="(11) 99999-9999" />
                    </div>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-7 rounded-2xl text-lg font-bold shadow-lg shadow-orange-200"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === 'signup' ? 'Finalizar Cadastro' : 'Entrar na Plataforma')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;