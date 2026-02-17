"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, Mail, Phone, MapPin, 
  CheckCircle2, XCircle, ShieldCheck, Save, Loader2, Eye, EyeOff, FileText, ExternalLink, Download
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { validateCPF } from '@/lib/validations';

interface UserManagerProps {
  user: any;
  onSuccess: () => void;
}

const UserManager = ({ user, onSuccess }: UserManagerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSearchingCep, setIsSearchingCep] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, setValue, formState: { isDirty } } = useForm({
    defaultValues: {
      full_name: user.full_name || '',
      email: user.email || '',
      document_id: user.document_id || user.cpf || user.cnpj || '',
      phone: user.phone || '',
      password: user.password || '', 
      zip_code: user.zip_code || user.cep || '',
      address: user.address || user.logradouro || '',
      number: user.number || '',
      complement: user.complement || '',
      neighborhood: user.neighborhood || user.bairro || '',
      city: user.city || user.localidade || '',
      state: user.state || user.uf || '',
    }
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
      setValue('address', data.logradouro, { shouldDirty: true });
      setValue('neighborhood', data.bairro, { shouldDirty: true });
      setValue('city', data.localidade, { shouldDirty: true });
      setValue('state', data.uf, { shouldDirty: true });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao buscar CEP" });
    } finally {
      setIsSearchingCep(false);
    }
  };

  const onSaveProfile = async (data: any) => {
    const doc = data.document_id.replace(/\D/g, '');
    if (doc.length === 11 && !validateCPF(data.document_id)) {
      toast({ variant: "destructive", title: "Documento Inválido", description: "O CPF informado não é válido." });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          email: data.email,
          document_id: data.document_id,
          phone: data.phone,
          password: data.password,
          address: data.address,
          number: data.number,
          complement: data.complement,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          neighborhood: data.neighborhood
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Dados do usuário atualizados com sucesso." });
      onSuccess();
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: error.message || "Erro ao atualizar banco de dados." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateKycStatus = async (status: 'verified' | 'rejected' | 'pending') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_status: status })
        .eq('id', user.id);

      if (error) throw error;

      toast({ 
        title: "Status KYC Atualizado", 
        description: `O usuário agora está: ${status}` 
      });
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-8 py-4 max-h-[75vh] overflow-y-auto pr-2">
      <div className="flex items-center justify-between bg-slate-900 p-5 rounded-2xl text-white sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-orange-500" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Status KYC</p>
            <p className="font-bold capitalize text-sm">{user.kyc_status || 'Pendente'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            type="button"
            size="sm" 
            variant="outline" 
            className="bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white rounded-xl"
            onClick={() => updateKycStatus('verified')}
            disabled={isLoading}
          >
            <CheckCircle2 size={16} className="mr-1" /> Aprovar
          </Button>
          <Button 
            type="button"
            size="sm" 
            variant="outline" 
            className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl"
            onClick={() => updateKycStatus('rejected')}
            disabled={isLoading}
          >
            <XCircle size={16} className="mr-1" /> Rejeitar
          </Button>
        </div>
      </div>

      {/* SEÇÃO DE DOCUMENTO ANEXADO */}
      <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-orange-900 font-bold">
          <FileText size={18} />
          <h3>Documento de Identidade Anexado</h3>
        </div>
        
        {user.document_url ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-32 h-20 bg-white rounded-xl border border-orange-200 overflow-hidden flex items-center justify-center">
              {user.document_url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                <img src={user.document_url} alt="Documento" className="w-full h-full object-cover" />
              ) : (
                <FileText size={32} className="text-orange-300" />
              )}
            </div>
            <div className="flex-1 space-y-2 w-full">
              <p className="text-xs text-orange-700 font-medium">O cliente anexou um arquivo para verificação.</p>
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1 bg-white border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white rounded-xl h-10 text-xs font-bold"
                  onClick={() => window.open(user.document_url, '_blank')}
                >
                  <ExternalLink size={14} className="mr-2" /> Visualizar
                </Button>
                <a 
                  href={user.document_url} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full bg-white border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white rounded-xl h-10 text-xs font-bold"
                  >
                    <Download size={14} className="mr-2" /> Baixar
                  </Button>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-white/50 rounded-xl border border-dashed border-orange-200">
            <p className="text-xs text-orange-400 font-medium italic">Nenhum documento anexado por este usuário ainda.</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold border-b pb-2">
          <User size={18} className="text-orange-500" />
          <h3>Dados Pessoais</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <input {...register('full_name')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <input {...register('email')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="space-y-2">
            <Label>CPF / CNPJ</Label>
            <input {...register('document_id')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="000.000.000-00" />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <input {...register('phone')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="(00) 00000-0000" />
          </div>
          <div className="space-y-2">
            <Label>Senha de Acesso</Label>
            <div className="relative">
              <input 
                {...register('password')} 
                type={showPassword ? "text" : "password"}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold border-b pb-2">
          <MapPin size={18} className="text-orange-500" />
          <h3>Endereço</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CEP</Label>
            <div className="relative">
              <input 
                {...register('zip_code')} 
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10" 
                placeholder="00000-000"
                onBlur={handleCepBlur}
              />
              {isSearchingCep && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Rua / Logradouro</Label>
            <input {...register('address')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Número</Label>
              <input {...register('number')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            <div className="space-y-2">
              <Label>Complemento</Label>
              <input {...register('complement')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bairro</Label>
            <input {...register('neighborhood')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <input {...register('city')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            <div className="space-y-2">
              <Label>Estado (UF)</Label>
              <input {...register('state')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" maxLength={2} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button 
          type="submit" 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-6 font-bold shadow-lg shadow-orange-100"
          disabled={isLoading || !isDirty}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

export default UserManager;