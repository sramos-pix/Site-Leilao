"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Trash2, ShieldCheck, ShieldAlert, MapPin, Phone, CreditCard, Mail } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

interface UserManagerProps {
  user: any;
  onSuccess: () => void;
}

const UserManager = ({ user, onSuccess }: UserManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    document_id: user.document_id || '',
    phone: user.phone || '',
    kyc_status: user.kyc_status || 'pending',
    address: user.address || '',
    city: user.city || '',
    state: user.state || ''
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Dados do usuário atualizados." });
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto px-1">
      <div className={`p-4 rounded-2xl border flex items-center gap-4 ${formData.kyc_status === 'verified' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
        {formData.kyc_status === 'verified' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
        <div>
          <p className="text-sm font-bold">Status de Verificação</p>
          <p className="text-xs opacity-80">
            {formData.kyc_status === 'verified' ? 'Usuário habilitado para participar de leilões.' : 'Aguardando aprovação de documentos.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <CreditCard size={16} /> Identificação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>CPF / CNPJ</Label>
            <Input value={formData.document_id} onChange={(e) => setFormData({...formData, document_id: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={user.email} disabled className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <MapPin size={16} /> Localização
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Estado (UF)</Label>
              <Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} maxLength={2} />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label className="text-sm font-bold text-slate-900">Aprovação de Cadastro</Label>
        <Select value={formData.kyc_status} onValueChange={(value) => setFormData({...formData, kyc_status: value})}>
          <SelectTrigger className={formData.kyc_status === 'verified' ? 'border-green-500 bg-green-50' : ''}>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="verified">Verificado (Aprovado)</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-6 flex justify-end gap-3">
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default UserManager;