"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, Mail, Phone, MapPin, FileText, 
  CheckCircle2, XCircle, Clock, ShieldCheck 
} from 'lucide-react';

interface UserManagerProps {
  user: any;
  onSuccess: () => void;
}

const UserManager = ({ user, onSuccess }: UserManagerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const updateKycStatus = async (status: 'verified' | 'rejected' | 'pending') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_status: status })
        .eq('id', user.id);

      if (error) throw error;

      toast({ 
        title: "Status Atualizado", 
        description: `O usuário agora está com status: ${status}` 
      });
      onSuccess();
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro ao atualizar", 
        description: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const InfoSection = ({ title, icon: Icon, children }: any) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-900 font-bold border-b pb-2">
        <Icon size={18} className="text-orange-500" />
        <h3>{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {children}
      </div>
    </div>
  );

  const DataField = ({ label, value }: { label: string, value: string }) => (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</p>
      <p className="text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
        {value || 'Não informado'}
      </p>
    </div>
  );

  return (
    <div className="space-y-8 py-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Status do KYC */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-orange-500" />
          <div>
            <p className="text-xs text-slate-400">Status de Verificação</p>
            <p className="font-bold capitalize">{user.kyc_status || 'Pendente'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
            onClick={() => updateKycStatus('verified')}
            disabled={isLoading}
          >
            <CheckCircle2 size={16} className="mr-2" /> Aprovar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
            onClick={() => updateKycStatus('rejected')}
            disabled={isLoading}
          >
            <XCircle size={16} className="mr-2" /> Rejeitar
          </Button>
        </div>
      </div>

      {/* Dados Pessoais */}
      <InfoSection title="Dados Pessoais" icon={User}>
        <DataField label="Nome Completo" value={user.full_name} />
        <DataField label="E-mail" value={user.email} />
        <DataField label="CPF / CNPJ" value={user.document_id || user.cpf || user.cnpj} />
        <DataField label="Telefone" value={user.phone} />
      </InfoSection>

      {/* Endereço */}
      <InfoSection title="Endereço" icon={MapPin}>
        <DataField label="CEP" value={user.zip_code || user.cep} />
        <DataField label="Logradouro" value={user.address} />
        <DataField label="Número" value={user.number} />
        <DataField label="Complemento" value={user.complement} />
        <DataField label="Bairro" value={user.neighborhood || user.bairro} />
        <DataField label="Cidade/UF" value={`${user.city || ''} - ${user.state || ''}`} />
      </InfoSection>

      {/* Outras Informações */}
      <InfoSection title="Sistema" icon={Clock}>
        <DataField label="ID do Usuário" value={user.id} />
        <DataField label="Data de Cadastro" value={new Date(user.created_at).toLocaleString('pt-BR')} />
      </InfoSection>
    </div>
  );
};

export default UserManager;