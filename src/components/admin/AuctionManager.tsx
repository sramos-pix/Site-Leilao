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
import { Plus, Trash2, MapPin, Calendar, Loader2, Edit } from 'lucide-react';

const AuctionManager = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAuction, setEditingAuction] = useState<any>(null);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const auctionData = {
      title: formData.get('title'),
      location: formData.get('location'),
      starts_at: new Date(formData.get('starts_at') as string).toISOString(),
      ends_at: new Date(formData.get('ends_at') as string).toISOString(),
      status: formData.get('status') || 'scheduled'
    };

    let error;
    if (editingAuction) {
      const { error: updateError } = await supabase
        .from('auctions')
        .update(auctionData)
        .eq('id', editingAuction.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('auctions')
        .insert({ ...auctionData, status: 'scheduled' });
      error = insertError;
    }

    if (error) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
    } else {
      toast({ title: "Sucesso", description: editingAuction ? "Leilão atualizado." : "Leilão criado." });
      setEditingAuction(null);
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

  // Formata data para o input datetime-local (YYYY-MM-DDThh:mm)
  const formatForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Leilões</h2>
        <Dialog onOpenChange={(open) => !open && setEditingAuction(null)}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
              <Plus size={18} className="mr-2" /> Novo Leilão
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingAuction ? 'Editar Leilão' : 'Criar Novo Leilão'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" required defaultValue={editingAuction?.title} placeholder="Ex: Leilão de Frota Executiva" />
              </div>
              <div className="space-y-2">
                <Label>Localização</Label>
                <Input name="location" required defaultValue={editingAuction?.location} placeholder="Ex: São Paulo, SP" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input name="starts_at" type="datetime-local" required defaultValue={formatForInput(editingAuction?.starts_at)} />
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input name="ends_at" type="datetime-local" required defaultValue={formatForInput(editingAuction?.ends_at)} />
                </div>
              </div>
              <Button type="submit" className="w-full bg-orange-500" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : editingAuction ? 'Salvar Alterações' : 'Criar Leilão'}
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
                  <div className="flex justify-end gap-2">
                    <Dialog onOpenChange={(open) => open && setEditingAuction(auction)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50">
                          <Edit size={18} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl">
                        <DialogHeader>
                          <DialogTitle>Editar Leilão</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Título</Label>
                            <Input name="title" required defaultValue={auction.title} />
                          </div>
                          <div className="space-y-2">
                            <Label>Localização</Label>
                            <Input name="location" required defaultValue={auction.location} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Início</Label>
                              <Input name="starts_at" type="datetime-local" required defaultValue={formatForInput(auction.starts_at)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Término</Label>
                              <Input name="ends_at" type="datetime-local" required defaultValue={formatForInput(auction.ends_at)} />
                            </div>
                          </div>
                          <Button type="submit" className="w-full bg-orange-500" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(auction.id)} className="text-red-500 hover:bg-red-50">
                      <Trash2 size={18} />
                    </Button>
                  </div>
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