"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, Mail, Phone, MapPin, 
  ShieldCheck, Save, Loader2, FileText, Eye, Shield
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

  // Limpa o cargo caso ele tenha sido salvo com o erro anterior ("admin text-xs")
  const initialRole = user.role?.replace(' text-xs', '') || 'user';

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
      role: initialRole
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
    <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-6 py-4 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar">
      {/* Header de Status KYC - Mais compacto */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl text-white sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-xl">
            <ShieldCheck className="text-orange-500" size={20} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Status KYC</p>
            <p className="font-black capitalize text-sm">{user.kyc_status || 'Aguardando'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold h-8 text-xs" onClick={() => updateKycStatus('verified')}>Aprovar</Button>
          <Button type="button" size="sm" variant="destructive" className="rounded-lg font-bold h-8 text-xs" onClick={() => updateKycStatus('rejected')}>Rejeitar</Button>
        </div>
      </div>

      {/* Visualização de Documento - MINIATURA COMPACTA */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <FileText size={16} className="text-orange-500" />
            <h3>Documento</h3>
          </div>
          {user.document_url && (
            <a href={user.document_url} target="_blank" rel="noreferrer">
              <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] font-bold gap-1 text-orange-600 hover:bg-orange-50">
                <Eye size={12} /> ABRIR ORIGINAL
              </Button>
            </a>
          )}
        </div>
        
        {user.document_url ? (
          <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
              <img src={user.document_url} className="w-full h-full object-cover" alt="Doc" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Arquivo anexado</p>
              <p className="text-xs font-medium text-slate-600 truncate max-w-[200px]">Clique no botão ao lado para validar os dados em tela cheia.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold italic">Nenhum documento enviado pelo usuário</span>
          </div>
        )}
      </div>

      {/* Nível de Acesso */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
          <Shield size={16} />
          <h3>Nível de Acesso</h3>
        </div>
        <Select 
          value={currentRole} 
          onValueChange={(val) => setValue('role', val, { shouldDirty: true })}
        >
          <SelectTrigger className="bg-white rounded-xl h-10 border-blue-200 text-xs">
            <SelectValue placeholder="Selecione o cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user" className="text-xs">Usuário / Licitante</SelectItem>
            <SelectItem value="finance" className="text-xs">Financeiro</SelectItem>
            <SelectItem value="admin" className="text-xs">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dados Pessoais */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-50 pb-2">
          <User size={16} className="text-orange-500" />
          <h3>Dados Cadastrais</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">Nome Completo</Label>
            <input {...register('full_name')} className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:bg-white transition-colors" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">E-mail</Label>
            <input {...register('email')} className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:bg-white transition-colors" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">CPF</Label>
            <input {...register('document_id')} className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:bg-white transition-colors" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">Telefone</Label>
            <input {...register('phone')} className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:bg-white transition-colors" />
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-50 pb-2">
            <MapPin size={16} className="text-orange-500" />
            <h3>Endereço</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">CEP</Label>
              <input {...register('zip_code')} className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Rua</Label>
              <input {...register('address')} className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Nº</Label>
              <input {...register('number')} className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Bairro</Label>
              <input {...register('neighborhood')} className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Cidade/UF</Label>
              <div className="flex gap-1">
                <input {...register('city')} className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-medium" />
                <input {...register('state')} maxLength={2} className="flex h-10 w-10 rounded-lg border border-slate-200 bg-slate-50 px-1 py-2 text-[10px] font-bold text-center uppercase" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-6 font-black text-sm shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
          disabled={isLoading || !isDirty}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          SALVAR ALTERAÇÕES
        </Button>
      </div>
    </form>
  );
};

export default UserManager;