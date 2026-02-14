"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Mail, Lock, User, Loader2, ArrowRight, Phone, CreditCard, MapPin, ChevronLeft, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Register = () => {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
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
      // 1. Criar usuário no Auth
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
        // 2. Inserir dados na tabela profiles com mapeamento exato das colunas
        const profileData = {
          id: authData.user.id,
          full_name: fullName,
          email: email,
          document_id: cpf.replace(/[^\d]+/g, ''),
          phone: phone.replace(/[^\d]+/g, ''),
          zip_code: cep.replace(/[^\d]+/g, ''),
          address: address,
          number: number,
          complement: complement,
          neighborhood: neighborhood,
          city: city,
          state: state,
          kyc_status: 'waiting'
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData); // Usamos upsert para garantir que grave mesmo se a trigger já criou o registro

        if (profileError) throw profileError;
      }

      toast({ 
        title: "Cadastro realizado!", 
        description: "Bem-vindo à plataforma AutoBid." 
      });
      
      navigate('/app');
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao realizar cadastro.");
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
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Nome completo" 
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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