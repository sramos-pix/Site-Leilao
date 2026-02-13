"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, ShieldCheck, User } from 'lucide-react';

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

  return (
    <div className="space-y-6 py-4">
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
          <Label>Status de Verificação (KYC)</Label>
          <Select 
            value={formData.kyc_status} 
            onValueChange={(value) => setFormData({...formData, kyc_status: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="verified">Verificado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end gap-3">
        <Button variant="outline" onClick={() => onSuccess()}>Cancelar</Button>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white" 
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default UserManager;