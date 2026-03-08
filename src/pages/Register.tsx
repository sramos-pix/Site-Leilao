"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Mail, Lock, User, Loader2, ArrowRight, Phone, CreditCard, MapPin, ChevronLeft, ShieldCheck, AlertCircle } from 'lucide-react';

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

const Register = () => {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [isSearchingCep, setIsSearchingCep] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1 Data
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  // Step 2 Data
  const [cpf, setCpf] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [cep, setCep] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [number, setNumber] = React.useState('');
  const [neighborhood, setNeighborhood] = React.useState('');
  const [complement, setComplement] = React.useState('');

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
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
      toast({
        variant: 'destructive',
        title: 'Erro ao continuar com Google',
        description: 'Não foi possível conectar com sua conta Google. Tente novamente.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/[^\d]+/g, '');
    if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cleanCPF.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cleanCPF.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cleanCPF.charAt(10))) return false;
    return true;
  };

  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/[^\d]+/g, '');
    if (cleanCep.length === 8) {
      setIsSearchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setAddress(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
        } else {
          toast({ variant: "destructive", title: "CEP não encontrado" });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!validateCPF(cpf)) {
      setErrorMessage("O CPF informado é inválido.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName,
          }
        }
      });
      
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            document_id: cpf.replace(/[^\d]+/g, ''),
            phone: phone.replace(/[^\d]+/g, ''),
            zip_code: cep.replace(/[^\d]+/g, ''),
            address: address,
            number: number,
            complement: complement,
            neighborhood: neighborhood,
            city: city,
            state: state,
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        // Enviar email de boas-vindas (fire-and-forget — não bloqueia a navegação)
        supabase.functions.invoke('send-email', {
          body: {
            type: 'welcome',
            to: email,
            payload: {
              name: fullName || email.split('@')[0] || 'Usuário',
            },
          },
        }).catch(() => {}); // ignora erros de email para não prejudicar o UX
      }

      toast({
        title: "Cadastro realizado!",
        description: "Bem-vindo à plataforma AutoBid."
      });
      
      // Redireciona com o parâmetro de nova conversão
      navigate('/app/dashboard?newSignup=1');
    } catch (error: any) {
      let msg = error.message || "Erro ao realizar cadastro.";
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already exists')) {
        msg = "Este e-mail já está cadastrado em nosso sistema. Por favor, faça login.";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg shadow-orange-200">
            <Gavel size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            {step === 1 ? "Crie sua Conta" : "Dados de Perfil"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {step === 1 
              ? "Junte-se à maior plataforma de leilões de veículos." 
              : "Complete seu cadastro para começar a dar lances."}
          </CardDescription>
          
          <div className="flex justify-center gap-2 mt-4">
            <div className={cn("h-1.5 w-8 rounded-full transition-all", step === 1 ? "bg-orange-500" : "bg-slate-200")} />
            <div className={cn("h-1.5 w-8 rounded-full transition-all", step === 2 ? "bg-orange-500" : "bg-slate-200")} />
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          {errorMessage && (
            <Alert variant="destructive" className="mb-6 rounded-xl bg-red-50 border-red-100 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <>
            <Button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
              className="w-full h-12 mb-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isGoogleLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <GoogleLogo />
                  Cadastrar com Google
                </>
              )}
            </Button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">ou cadastre-se com e-mail</span>
              </div>
            </div>

            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="Nome completo"
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="password"
                  placeholder="Crie uma senha forte"
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="password"
                  placeholder="Confirme sua senha"
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200"
              >
                Próximo Passo <ArrowRight className="ml-2" size={18} />
              </Button>
            </form>
            </>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="CPF" 
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={cpf}
                  onChange={(e) => setCpf(maskCPF(e.target.value))}
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Telefone (DDD)" 
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    placeholder="CEP" 
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                    value={cep}
                    onChange={(e) => setCep(maskCEP(e.target.value))}
                    onBlur={handleCepBlur}
                    required
                  />
                  {isSearchingCep && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-orange-500" size={16} />}
                </div>
                <Input 
                  placeholder="Nº" 
                  className="h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Endereço" 
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Bairro" 
                  className="h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  required
                />
                <Input 
                  placeholder="Cidade" 
                  className="h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="UF" 
                  className="h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  maxLength={2}
                  required
                />
                <Input 
                  placeholder="Complemento" 
                  className="h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-12 rounded-xl border-slate-200 text-slate-600"
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Finalizar Cadastro"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50 p-6 flex flex-col space-y-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 text-center font-medium">
            Já possui uma conta?{" "}
            <Link to="/login" className="text-orange-600 font-bold hover:underline">Fazer login</Link>
          </p>
          <Link to="/" className="text-xs text-slate-400 text-center hover:text-slate-600 flex items-center justify-center gap-1">
            Voltar para o início <ArrowRight size={12} />
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default Register;