"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, Save, Trash2, ShieldCheck, ShieldAlert, 
  MapPin, CreditCard, AlertTriangle, FileText, Eye,
  CheckCircle2, XCircle, Image as ImageIcon
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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

  const updateStatus = async (status: 'verified' | 'rejected') => {
    setFormData(prev => ({ ...prev, kyc_status: status }));
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast({ 
        title: "Perfil Removido", 
        description: "O perfil foi excluído do banco." 
      });
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto px-1">
      {/* Status de Verificação */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-center gap-4 ${formData.kyc_status === 'verified' ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${formData.kyc_status === 'verified' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
            {formData.kyc_status === 'verified' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Status de Verificação</p>
            <p className="text-xs text-slate-600">
              {formData.kyc_status === 'verified' ? 'Usuário habilitado para lances.' : 'Aguardando análise de documentos.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => updateStatus('verified')}
            className={formData.kyc_status === 'verified' ? 'bg-green-600 text-white border-none' : 'bg-white'}
          >
            <CheckCircle2 size={16} className="mr-2" /> Aprovar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => updateStatus('rejected')}
            className={formData.kyc_status === 'rejected' ? 'bg-red-600 text-white border-none' : 'bg-white'}
          >
            <XCircle size={16} className="mr-2" /> Rejeitar
          </Button>
        </div>
      </div>

      {/* Documentos Enviados */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileText size={16} /> Documentos para Análise
        </h3>
        {user.kyc_status === 'pending' || user.kyc_status === 'verified' ? (
          <div className="p-4 bg-white border rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <ImageIcon size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Documento de Identidade</p>
                <p className="text-xs text-slate-500">Enviado em {new Date(user.updated_at || user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50">
              <Eye size={16} className="mr-2" /> Visualizar
            </Button>
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed rounded-2xl text-slate-400 italic text-sm">
            Nenhum documento enviado recentemente.
          </div>
        )}
      </div>

      <Separator />

      {/* Dados Pessoais */}
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

      {/* Localização */}
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
                Esta ação excluirá o perfil de <strong>{user.full_name}</strong>.
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