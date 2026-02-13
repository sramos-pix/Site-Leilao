"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, Save, Trash2, ShieldCheck, ShieldAlert, 
  MapPin, CreditCard, AlertTriangle, FileText, Eye,
  CheckCircle2, XCircle, Image as ImageIcon
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
    state: user.state || ''
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').update(formData).eq('id', user.id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Dados atualizados." });
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto px-1">
      <div className={`p-6 rounded-3xl border flex justify-between items-center ${formData.kyc_status === 'verified' ? 'bg-green-50' : 'bg-orange-50'}`}>
        <div className="flex items-center gap-4">
          {formData.kyc_status === 'verified' ? <ShieldCheck className="text-green-600" /> : <ShieldAlert className="text-orange-600" />}
          <div>
            <p className="font-bold">Status: {formData.kyc_status}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setFormData({...formData, kyc_status: 'verified'})}>Aprovar</Button>
          <Button size="sm" variant="outline" onClick={() => setFormData({...formData, kyc_status: 'rejected'})}>Rejeitar</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
          <FileText size={16} /> Documento Enviado
        </h3>
        {user.document_url ? (
          <div className="p-4 bg-white border rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <ImageIcon className="text-slate-400" />
              <p className="text-sm font-bold">Foto do Documento</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-orange-600">
                  <Eye size={16} className="mr-2" /> Visualizar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>Documento de {user.full_name}</DialogTitle></DialogHeader>
                <img src={user.document_url} alt="Documento" className="w-full rounded-xl" />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed rounded-2xl text-slate-400 italic">
            Nenhum documento anexado.
          </div>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome Completo</Label>
          <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>CPF</Label>
          <Input value={formData.document_id} onChange={(e) => setFormData({...formData, document_id: e.target.value})} />
        </div>
      </div>

      <Button className="w-full bg-slate-900 text-white py-6 rounded-xl" onClick={handleSave} disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
      </Button>
    </div>
  );
};

export default UserManager;