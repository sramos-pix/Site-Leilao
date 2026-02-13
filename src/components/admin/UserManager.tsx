"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
    kyc_status: user.kyc_status || 'pending'
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
      // Nota: Em um cenário real, você precisaria de uma Edge Function para deletar do Auth também.
      // Aqui deletamos o perfil para remover da listagem administrativa.
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
    <div className="space-y-6 py-4">
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${formData.kyc_status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
          {formData.kyc_status === 'verified' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Status de Acesso</p>
          <p className="text-xs text-slate-500">
            {formData.kyc_status === 'verified' 
              ? 'Usuário aprovado para dar lances.' 
              : 'Acesso restrito até a aprovação dos documentos.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome Completo</Label>
          <Input 
            value={formData.full_name} 
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Documento (CPF/CNPJ)</Label>
          <Input 
            value={formData.document_id} 
            onChange={(e) => setFormData({...formData, document_id: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Aprovação da Conta</Label>
          <Select 
            value={formData.kyc_status} 
            onValueChange={(value) => setFormData({...formData, kyc_status: value})}
          >
            <SelectTrigger className={formData.kyc_status === 'verified' ? 'border-green-500 bg-green-50' : ''}>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente (Aguardando)</SelectItem>
              <SelectItem value="verified">Verificado (Aprovado para Lances)</SelectItem>
              <SelectItem value="rejected">Rejeitado (Acesso Negado)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-6 border-t flex justify-between items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
              <Trash2 size={18} className="mr-2" /> Excluir Usuário
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o perfil de <strong>{user.full_name}</strong> da plataforma.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600 rounded-xl">
                Confirmar Exclusão
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex gap-3">
          <Button 
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserManager;