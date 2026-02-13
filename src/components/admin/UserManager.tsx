"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Trash2, ShieldCheck, ShieldAlert, MapPin, CreditCard, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

interface UserManagerProps {
  user: any;
  onSuccess: () => void;
}

const UserManager = ({ user, onSuccess }: UserManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      // Nota: Isso remove apenas o perfil da tabela 'profiles'. 
      // Para remover o usuário do Auth, seria necessário uma Edge Function ou Admin API.
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: "Usuário Removido", description: "O perfil foi excluído com sucesso." });
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
    } finally {
      setIsDeleting(false);
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

      <div className="pt-6 flex justify-between items-center gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl">
              <Trash2 size={18} className="mr-2" /> Excluir Usuário
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" /> Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação excluirá permanentemente o perfil de <strong>{user.full_name}</strong>. 
                Lances e históricos vinculados a este ID podem ser afetados. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : "Sim, Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default UserManager;