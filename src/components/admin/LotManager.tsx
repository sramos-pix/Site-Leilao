"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';

interface LotManagerProps {
  auctionId: string;
}

const LotManager = ({ auctionId }: LotManagerProps) => {
  const [lots, setLots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchLots = async () => {
    const { data, error } = await supabase
      .from('lots')
      .select('*')
      .eq('auction_id', auctionId)
      .order('lot_number', { ascending: true });

    if (error) {
      toast({ variant: "destructive", title: "Erro ao carregar lotes", description: error.message });
    } else {
      setLots(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLots();
  }, [auctionId]);

  const handleUpdateLot = async (lotId: string, updates: any) => {
    setIsSaving(true);
    const { error } = await supabase
      .from('lots')
      .update(updates)
      .eq('id', lotId);

    if (error) {
      toast({ variant: "destructive", title: "Erro ao atualizar", description: error.message });
    } else {
      toast({ title: "Sucesso", description: "Lote atualizado com sucesso." });
      fetchLots();
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1">
      {lots.length === 0 && (
        <p className="text-center text-slate-500 py-4">Nenhum lote cadastrado para este leilão.</p>
      )}
      
      {lots.map((lot) => (
        <div key={lot.id} className="p-4 border rounded-2xl bg-slate-50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título do Lote</Label>
              <Input 
                defaultValue={lot.title} 
                onBlur={(e) => handleUpdateLot(lot.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Lance Inicial (R$)</Label>
              <Input 
                type="number"
                defaultValue={lot.starting_price} 
                onBlur={(e) => handleUpdateLot(lot.id, { starting_price: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">ID: {lot.id}</span>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
              <Trash2 size={16} className="mr-2" /> Remover Lote
            </Button>
          </div>
        </div>
      ))}
      
      <Button className="w-full border-dashed border-2 bg-transparent text-slate-600 hover:bg-slate-50 py-8 rounded-2xl">
        <Plus size={20} className="mr-2" /> Adicionar Novo Lote
      </Button>
    </div>
  );
};

export default LotManager;