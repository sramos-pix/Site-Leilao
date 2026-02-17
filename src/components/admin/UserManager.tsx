"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, Mail, Phone, MapPin, 
  CheckCircle2, XCircle, ShieldCheck, Save, Loader2, Eye, EyeOff, FileText, ExternalLink, Download, Shield
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { validateCPF } from '@/lib/validations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserManagerProps {
  user: any;
  onSuccess: () => void;
}

const UserManager = ({ user, onSuccess }: UserManagerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSearchingCep, setIsSearchingCep] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, setValue, watch, formState: { isDirty } } = useForm({
    defaultValues: {
      full_name: user.full_name || '',
      email: user.email || '',
      document_id: user.document_id || '',
      phone: user.phone || '',
      password: user.password || '', 
      zip_code: user.zip_code || '',
      address: user.address || '',
      number: user.number || '',
      complement: user.complement || '',
      neighborhood: user.neighborhood || '',
      city: user.city || '',
      state: user.state || '',
      role: user.role || 'user'
    }
  });

  const currentRole = watch('role');

  const onSaveProfile = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Perfil atualizado." });
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
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
      toast({ title: "Status KYC Atualizado" });
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
          <Button type="button" size="sm" variant="outline" className="bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 rounded-xl" onClick={() => updateKycStatus('verified')}>Aprovar</Button>
          <Button type="button" size="sm" variant="outline" className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 rounded-xl" onClick={() => updateKycStatus('rejected')}>Rejeitar</Button>
        </div>
      </div>

      {/* SEÇÃO DE CARGO / PERMISSÕES */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <Shield size={18} />
          <h3>Nível de Acesso (Permissões)</h3>
        </div>
        <div className="space-y-2">
          <Label>Cargo do Usuário</Label>
          <Select 
            value={currentRole} 
            onValueChange={(val) => setValue('role', val, { shouldDirty: true })}
          >
            <SelectTrigger className="bg-white rounded-xl h-12">
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário / Licitante (Padrão)</SelectItem>
              <SelectItem value="finance">Financeiro (Gere pagamentos)</SelectItem>
              <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-blue-600 font-medium">
            {currentRole === 'admin' ? 'Acesso total ao painel, leilões e usuários.' : 
             currentRole === 'finance' ? 'Acesso restrito à aba de pagamentos e dashboard.' : 
             'Acesso apenas à área do cliente.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold border-b pb-2">
          <User size={18} className="text-orange-500" />
          <h3>Dados Pessoais</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <input {...register('full_name')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <input {...register('email')} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button 
          type="submit" 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-6 font-bold shadow-lg"
          disabled={isLoading || !isDirty}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações de Perfil e Cargo
        </Button>
      </div>
    </form>
  );
};

export default UserManager;