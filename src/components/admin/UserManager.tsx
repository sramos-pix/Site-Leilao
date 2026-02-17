"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, Mail, Phone, MapPin, 
  CheckCircle2, XCircle, ShieldCheck, Save, Loader2, FileText, ExternalLink, Shield, Eye
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserManagerProps {
  user: any;
  onSuccess: () => void;
}

const UserManager = ({ user, onSuccess }: UserManagerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, setValue, watch, formState: { isDirty } } = useForm({
    defaultValues: {
      full_name: user.full_name || '',
      email: user.email || '',
      document_id: user.document_id || '',
      phone: user.phone || '',
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

      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso." });
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
      toast({ title: `Status KYC: ${status === 'verified' ? 'Aprovado' : 'Rejeitado'}` });
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-8 py-4 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar">
      {/* Header de Status KYC */}
      <div className="flex items-center justify-between bg-slate-900 p-6 rounded-[2rem] text-white sticky top-0 z-10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/20 p-3 rounded-2xl">
            <ShieldCheck className="text-orange-500" size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Status de Verificação</p>
            <p className="font-black capitalize text-lg">{user.kyc_status || 'Aguardando Envio'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6" onClick={() => updateKycStatus('verified')}>Aprovar</Button>
          <Button type="button" size="sm" variant="destructive" className="rounded-xl font-bold px-6" onClick={() => updateKycStatus('rejected')}>Rejeitar</Button>
        </div>
      </div>

      {/* Visualização de Documento */}
      <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-black">
            <FileText size={20} className="text-orange-500" />
            <h3>Documento Enviado</h3>
          </div>
          {user.document_url ? (
            <a href={user.document_url} target="_blank" rel="noreferrer">
              <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2 border-slate-200 font-bold">
                <Eye size={16} /> Ver Documento Original
              </Button>
            </a>
          ) : (
            <span className="text-xs text-slate-400 font-bold italic">Nenhum documento anexado</span>
          )}
        </div>
        
        {user.document_url && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden border-4 border-slate-50 bg-slate-100 relative group">
            <img src={user.document_url} className="w-full h-full object-contain" alt="Documento do Usuário" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <p className="text-white font-bold text-sm">Clique no botão acima para ampliar</p>
            </div>
          </div>
        )}
      </div>

      {/* Nível de Acesso */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] space-y-4">
        <div className="flex items-center gap-2 text-blue-900 font-black">
          <Shield size={20} />
          <h3>Nível de Acesso (Permissões)</h3>
        </div>
        <div className="space-y-2">
          <Label className="text-blue-700 font-bold">Cargo do Usuário</Label>
          <Select 
            value={currentRole} 
            onValueChange={(val) => setValue('role', val, { shouldDirty: true })}
          >
            <SelectTrigger className="bg-white rounded-xl h-12 border-blue-200">
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário / Licitante (Padrão)</SelectItem>
              <SelectItem value="finance">Financeiro (Gere pagamentos)</SelectItem>
              <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">
            {currentRole === 'admin' ? 'Acesso total ao sistema.' : 
             currentRole === 'finance' ? 'Acesso restrito a pagamentos e dashboard.' : 
             'Acesso apenas à área do cliente.'}
          </p>
        </div>
      </div>

      {/* Dados Pessoais */}
      <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-slate-900 font-black border-b border-slate-50 pb-4">
          <User size={20} className="text-orange-500" />
          <h3>Dados Cadastrais</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="font-bold text-slate-600">Nome Completo</Label>
            <input {...register('full_name')} className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:bg-white transition-colors" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-slate-600">E-mail</Label>
            <input {...register('email')} className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:bg-white transition-colors" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-slate-600">CPF</Label>
            <input {...register('document_id')} className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:bg-white transition-colors" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-slate-600">Telefone</Label>
            <input {...register('phone')} className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:bg-white transition-colors" />
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-black border-b border-slate-50 pb-4">
            <MapPin size={20} className="text-orange-500" />
            <h3>Endereço</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label className="font-bold text-slate-600">CEP</Label>
              <input {...register('zip_code')} className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold text-slate-600">Rua / Logradouro</Label>
              <input {...register('address')} className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-600">Número</Label>
              <input {...register('number')} className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-600">Bairro</Label>
              <input {...register('neighborhood')} className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-600">Cidade/UF</Label>
              <div className="flex gap-2">
                <input {...register('city')} className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium" />
                <input {...register('state')} maxLength={2} className="flex h-12 w-16 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-sm font-medium text-center uppercase" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-[1.5rem] py-8 font-black text-lg shadow-xl shadow-orange-100 transition-all active:scale-[0.98]"
          disabled={isLoading || !isDirty}
        >
          {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Save className="mr-2 h-6 w-6" />}
          SALVAR ALTERAÇÕES DO PERFIL
        </Button>
      </div>
    </form>
  );
};

export default UserManager;