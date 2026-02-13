"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, Mail, Phone, MapPin, 
  CheckCircle2, XCircle, ShieldCheck, Save, Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';

interface UserManagerProps {
  user: any;
  onSuccess: () => void;
}

const UserManager = ({ user, onSuccess }: UserManagerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: {
      full_name: user.full_name || '',
      email: user.email || '',
      document_id: user.document_id || user.cpf || user.cnpj || '',
      phone: user.phone || '',
      zip_code: user.zip_code || user.cep || '',
      address: user.address || '',
      number: user.number || '',
      complement: user.complement || '',
      neighborhood: user.neighborhood || user.bairro || '',
      city: user.city || '',
      state: user.state || '',
    }
  });

  const onSaveProfile = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          email: data.email,
          document_id: data.document_id,
          phone: data.phone,
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
        description: error.message 
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
      {/* Cabeçalho de Status */}
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

      {/* Dados Pessoais */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold border-b pb-2">
          <User size={18} className="text-orange-500" />
          <h3>Dados Pessoais</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input {...register('full_name')} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input {...register('email')} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>CPF / CNPJ</Label>
            <Input {...register('document_id')} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input {...register('phone')} className="rounded-xl" />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold border-b pb-2">
          <MapPin size={18} className="text-orange-500" />
          <h3>Endereço</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CEP</Label>
            <Input {...register('zip_code')} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Rua / Logradouro</Label>
            <Input {...register('address')} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Número</Label>
              <Input {...register('number')} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Complemento</Label>
              <Input {...register('complement')} className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input {...register('neighborhood')} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input {...register('city')} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Estado (UF)</Label>
              <Input {...register('state')} className="rounded-xl" maxLength={2} />
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