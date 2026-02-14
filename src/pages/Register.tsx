"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Mail, Lock, User, Loader2, ArrowRight, Phone, CreditCard, MapPin, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const Register = () => {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1 Data
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Step 2 Data
  const [cpf, setCpf] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName,
            cpf: cpf,
            phone: phone,
            address: address,
            city: city
          }
        }
      });
      
      if (error) throw error;
      
      toast({ 
        title: "Conta criada!", 
        description: "Verifique seu e-mail para confirmar o cadastro." 
      });
      navigate('/login');
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro no cadastro", 
        description: error.message || "Tente novamente mais tarde." 
      });
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
          
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <div className={cn("h-1.5 w-8 rounded-full transition-all", step === 1 ? "bg-orange-500" : "bg-slate-200")} />
            <div className={cn("h-1.5 w-8 rounded-full transition-all", step === 2 ? "bg-orange-500" : "bg-slate-200")} />
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-4">
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
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Telefone / WhatsApp" 
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Endereço completo" 
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Cidade / UF" 
                  className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
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

// Helper function for conditional classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default Register;