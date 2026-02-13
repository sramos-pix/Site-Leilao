"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Car, Loader2, Copy } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const LotManager = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    const [lotsRes, auctionsRes] = await Promise.all([
      supabase.from('lots').select('*').order('lot_number', { ascending: true }),
      supabase.from('auctions').select('id, title')
    ]);
    
    setLots(lotsRes.data || []);
    setAuctions(auctionsRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const newLot = {
      auction_id: formData.get('auction_id'),
      lot_number: parseInt(formData.get('lot_number') as string),
      title: formData.get('title'),
      brand: formData.get('brand'),
      model: formData.get('model'),
      year: parseInt(formData.get('year') as string),
      mileage_km: parseInt(formData.get('mileage_km') as string),
      start_bid: parseFloat(formData.get('start_bid') as string),
      ends_at: new Date(formData.get('ends_at') as string).toISOString(),
      current_bid: null
    };

    const { error } = await supabase.from('lots').insert(newLot);

    if (error) {
      toast({ variant: "destructive", title: "Erro ao criar", description: error.message });
    } else {
      toast({ title: "Sucesso", description: "Veículo cadastrado com sucesso." });
      fetchData();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este veículo?')) return;
    const { error } = await supabase.from('lots').delete().eq('id', id);
    if (error) toast({ variant: "destructive", title: "Erro", description: error.message });
    else fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Veículos (Lotes)</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
              <Plus size={18} className="mr-2" /> Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Veículo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>Leilão Vinculado</Label>
                <Select name="auction_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o leilão" />
                  </SelectTrigger>
                  <SelectContent>
                    {auctions.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número do Lote</Label>
                <Input name="lot_number" type="number" required />
              </div>
              <div className="space-y-2">
                <Label>Título do Lote</Label>
                <Input name="title" required placeholder="Ex: BMW 320i M Sport" />
              </div>
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input name="brand" required />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input name="model" required />
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input name="year" type="number" required />
              </div>
              <div className="space-y-2">
                <Label>Quilometragem (KM)</Label>
                <Input name="mileage_km" type="number" required />
              </div>
              <div className="space-y-2">
                <Label>Lance Inicial (R$)</Label>
                <Input name="start_bid" type="number" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label>Data de Encerramento</Label>
                <Input name="ends_at" type="datetime-local" required />
              </div>
              <Button type="submit" className="col-span-2 bg-orange-500 mt-4" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Cadastrar Veículo'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Lote</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Ano/KM</TableHead>
              <TableHead>Lance Inicial</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : lots.map((lot) => (
              <TableRow key={lot.id}>
                <TableCell className="font-mono text-xs">#{lot.lot_number}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Car size={16} className="text-slate-400" />
                    <span className="font-bold">{lot.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">{lot.year} • {lot.mileage_km.toLocaleString()} km</TableCell>
                <TableCell className="font-bold">{formatCurrency(lot.start_bid)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(lot.id)} className="text-red-500 hover:bg-red-50">
                    <Trash2 size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LotManager;