"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, Save, ShieldCheck, ShieldAlert, 
  MapPin, CreditCard, FileText, Eye,
  Image as ImageIcon, Phone, Mail, User
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
    state: user.state || '',
    email: user.email || ''
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: formData.full_name,
        document_id: formData.document_id,
        phone: formData.phone,
        kyc_status: formData.kyc_status,
        address: formData.address,
        city: formData.city,
        state: formData.state
      }).eq('id', user.id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Dados do usuário atualizados com sucesso." });
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
    } finally {
      setIsLoading(false);
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
            <p className="text-sm font-bold text-slate-900">Status da Conta</p>
            <p className="text-xs text-slate-600 uppercase font-bold">{formData.kyc_status}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={formData.kyc_status === 'verified' ? 'default' : 'outline'}
            className={formData.kyc_status === 'verified' ? 'bg-green-600 hover:bg-green-700' : ''}
            onClick={() => setFormData({...formData, kyc_status: 'verified'})}
          >
            Aprovar
          </Button>
          <Button 
            size="sm" 
            variant={formData.kyc_status === 'rejected' ? 'destructive' : 'outline'}
            onClick={() => setFormData({...formData, kyc_status: 'rejected'})}
          >
            Rejeitar
          </Button>
        </div>
      </div>

      {/* Documento */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
          <FileText size={16} /> Documento de Identidade
        </h3>
        {user.document_url ? (
          <div className="p-4 bg-white border rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <ImageIcon className="text-slate-400" />
              <p className="text-sm font-bold">Foto do Documento Enviada</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50">
                  <Eye size={16} className="mr-2" /> Visualizar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>Documento: {user.full_name}</DialogTitle></DialogHeader>
                <div className="mt-4 rounded-xl overflow-hidden border">
                  <img src={user.document_url} alt="Documento" className="w-full h-auto" />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="p-6 text-center border-2 border-dashed rounded-2xl text-slate-400 italic text-sm">
            Nenhum documento anexado pelo usuário.
          </div>
        )}
      </div>

      <Separator />

      {/* Informações Pessoais */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
          <User size={16} /> Dados Pessoais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>CPF</Label>
            <Input value={formData.document_id} onChange={(e) => setFormData({...formData, document_id: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail size={14} /> E-mail</Label>
            <Input value={formData.email} disabled className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Phone size={14} /> Telefone</Label>
            <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
          <MapPin size={16} /> Endereço
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Logradouro / Bairro</Label>
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

      <div className="pt-4">
        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl font-bold" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
          Salvar Todas as Alterações
        </Button>
      </div>
    </div>
  );
};

export default UserManager;