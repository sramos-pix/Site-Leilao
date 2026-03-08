"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, CreditCard, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

/**
 * CompleteProfile.tsx
 * -------------------
 * Exibida SOMENTE para usuários que fizeram login via Google OAuth
 * e ainda não preencheram CPF, telefone e endereço.
 * Após salvar, redireciona para o dashboard.
 */
const CompleteProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    // Garante que o usuário está logado; se não, manda pro login
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }
      const name = session.user.user_metadata?.full_name ||
                   session.user.user_metadata?.name ||
                   session.user.email?.split('@')[0] || '';
      setUserName(name);
    });
  }, [navigate]);

  const maskCPF = (v: string) =>
    v.replace(/\D/g, '')
     .replace(/(\d{3})(\d)/, '$1.$2')
     .replace(/(\d{3})(\d)/, '$1.$2')
     .replace(/(\d{3})(\d{1,2})/, '$1-$2')
     .replace(/(-\d{2})\d+?$/, '$1');

  const maskPhone = (v: string) =>
    v.replace(/\D/g, '')
     .replace(/(\d{2})(\d)/, '($1) $2')
     .replace(/(\d{5})(\d)/, '$1-$2')
     .replace(/(-\d{4})\d+?$/, '$1');

  const maskCEP = (v: string) =>
    v.replace(/\D/g, '')
     .replace(/(\d{5})(\d)/, '$1-$2')
     .replace(/(-\d{3})\d+?$/, '$1');

  const validateCPF = (cpf: string) => {
    const c = cpf.replace(/[^\d]+/g, '');
    if (c.length !== 11 || !!c.match(/(\d)\1{10}/)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(c.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(c.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(c.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    return rev === parseInt(c.charAt(10));
  };

  const handleCepBlur = async () => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsSearchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
        } else {
          toast({ variant: 'destructive', title: 'CEP não encontrado.' });
        }
      } catch {
        // silently ignore
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateCPF(cpf)) {
      setErrorMessage('CPF inválido. Verifique e tente novamente.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Telefone inválido.');
      return;
    }
    if (!address || !city || !state || !number) {
      setErrorMessage('Preencha todos os campos de endereço.');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada. Faça login novamente.');

      const { error } = await supabase
        .from('profiles')
        .update({
          document_id: cpf.replace(/[^\d]+/g, ''),
          phone: phone.replace(/[^\d]+/g, ''),
          zip_code: cep.replace(/[^\d]+/g, ''),
          address,
          number,
          complement,
          neighborhood,
          city,
          state,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Enviar email de boas-vindas (fire-and-forget — não bloqueia a navegação)
      supabase.functions.invoke('send-email', {
        body: {
          type: 'welcome',
          to: user.email,
          payload: {
            name: userName || user.email?.split('@')[0] || 'Usuário',
          },
        },
      }).catch(() => {}); // ignora erros de email para não prejudicar o UX

      toast({
        title: 'Perfil completo!',
        description: 'Suas informações foram salvas com sucesso.',
      });

      navigate('/app/dashboard?newSignup=1', { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <CardHeader className="space-y-2 text-center pt-8 pb-4">
          <div className="mx-auto bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg shadow-orange-200">
            <User size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            Complete seu Cadastro
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {userName ? `Olá, ${userName.split(' ')[0]}! ` : ''}
            Para participar dos leilões, precisamos de mais algumas informações.
          </CardDescription>

          {/* Indicador de progresso */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
              <CheckCircle2 size={14} />
              Conta Google conectada
            </div>
            <div className="w-6 h-px bg-slate-300" />
            <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
              <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              Dados pessoais
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-2">
          {errorMessage && (
            <Alert variant="destructive" className="mb-5 rounded-xl bg-red-50 border-red-100 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CPF */}
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                type="text"
                placeholder="CPF (000.000.000-00)"
                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                value={cpf}
                onChange={(e) => setCpf(maskCPF(e.target.value))}
                maxLength={14}
                required
              />
            </div>

            {/* Telefone */}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                type="text"
                placeholder="WhatsApp / Telefone"
                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                maxLength={15}
                required
              />
            </div>

            {/* CEP */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                type="text"
                placeholder="CEP"
                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-orange-500"
                value={cep}
                onChange={(e) => setCep(maskCEP(e.target.value))}
                onBlur={handleCepBlur}
                maxLength={9}
                required
              />
              {isSearchingCep && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={16} />
              )}
            </div>

            {/* Endereço (preenchido pelo CEP) */}
            {address && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in">
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="Rua / Av."
                    className="col-span-2 h-11 rounded-xl border-slate-200 text-sm"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Nº"
                    className="h-11 rounded-xl border-slate-200 text-sm"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Bairro"
                    className="h-11 rounded-xl border-slate-200 text-sm"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                  />
                  <Input
                    placeholder="Complemento"
                    className="h-11 rounded-xl border-slate-200 text-sm"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="Cidade"
                    className="col-span-2 h-11 rounded-xl border-slate-200 text-sm"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="UF"
                    className="h-11 rounded-xl border-slate-200 text-sm"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    maxLength={2}
                    required
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="animate-spin mr-2" size={18} /> Salvando...</>
              ) : (
                'Concluir Cadastro e Acessar'
              )}
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-4">
            Seus dados são protegidos e usados apenas para verificação de identidade nos leilões.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
