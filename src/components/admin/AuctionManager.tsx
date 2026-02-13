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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, MapPin, Calendar, Loader2 } from 'lucide-react';

const AuctionManager = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchAuctions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .order('starts_at', { ascending: false });
    
    if (error) toast({ variant: "destructive", title: "Erro", description: error.message });
    else setAuctions(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const newAuction = {
      title: formData.get('title'),
      location: formData.get('location'),
      starts_at: new Date(formData.get('starts_at') as string).toISOString(),
      ends_at: new Date(formData.get('ends_at') as string).toISOString(),
      status: 'scheduled'
    };

    const { error } = await supabase.from('auctions').insert(newAuction);

    if (error) {
      toast({ variant: "destructive", title: "Erro ao criar", description: error.message });
    } else {
      toast({ title: "Sucesso", description: "Leilão criado com sucesso." });
      fetchAuctions();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este leilão?')) return;
    const { error } = await supabase.from('auctions').delete().eq('id', id);
    if (error) toast({ variant: "destructive", title: "Erro", description: error.message });
    else fetchAuctions();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Leilões</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
              <Plus size={18} className="mr-2" /> Novo Leilão
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Leilão</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" required placeholder="Ex: Leilão de Frota Executiva" />
              </div>
              <div className="space-y-2">
                <Label>Localização</Label>
                <Input name="location" required placeholder="Ex: São Paulo, SP" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input name="starts_at" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input name="ends_at" type="datetime-local" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-orange-500" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Criar Leilão'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Datas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : auctions.map((auction) => (
              <TableRow key={auction.id}>
                <TableCell className="font-bold">{auction.title}</TableCell>
                <TableCell className="text-slate-500 flex items-center gap-1"><MapPin size={14} /> {auction.location}</TableCell>
                <TableCell className="text-xs text-slate-500">
                  <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(auction.starts_at).toLocaleDateString()}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{auction.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(auction.id)} className="text-red-500 hover:bg-red-50">
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

export default AuctionManager;