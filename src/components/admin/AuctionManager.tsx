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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        .insert(auctionData);
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

  const formatForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>;
      case 'finished': return <Badge variant="secondary">Finalizado</Badge>;
      case 'scheduled': return <Badge variant="outline" className="text-blue-500 border-blue-200">Agendado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
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
          <DialogContent className="rounded-3xl max-w-md">
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
              
              <div className="space-y-2">
                <Label>Status do Leilão</Label>
                <Select name="status" defaultValue={editingAuction?.status || 'scheduled'}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado (Aguardando início)</SelectItem>
                    <SelectItem value="active">Ativo (Recebendo lances)</SelectItem>
                    <SelectItem value="finished">Finalizado (Encerrado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 font-bold" disabled={isSubmitting}>
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
              <TableHead className="pl-6">Título</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Datas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-orange-500" /></TableCell></TableRow>
            ) : auctions.map((auction) => (
              <TableRow key={auction.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold pl-6">{auction.title}</TableCell>
                <TableCell className="text-slate-500">
                  <div className="flex items-center gap-1 text-xs"><MapPin size={14} className="text-orange-500" /> {auction.location}</div>
                </TableCell>
                <TableCell className="text-[10px] text-slate-500">
                  <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(auction.starts_at).toLocaleDateString()}</div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(auction.status)}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-blue-500 hover:bg-blue-50 rounded-full"
                      onClick={() => setEditingAuction(auction)}
                    >
                      <Edit size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(auction.id)} 
                      className="text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Edição Separado para garantir que o estado seja limpo corretamente */}
      {editingAuction && (
        <Dialog open={!!editingAuction} onOpenChange={() => setEditingAuction(null)}>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Leilão</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" required defaultValue={editingAuction.title} />
              </div>
              <div className="space-y-2">
                <Label>Localização</Label>
                <Input name="location" required defaultValue={editingAuction.location} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input name="starts_at" type="datetime-local" required defaultValue={formatForInput(editingAuction.starts_at)} />
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input name="ends_at" type="datetime-local" required defaultValue={formatForInput(editingAuction.ends_at)} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Status do Leilão</Label>
                <Select name="status" defaultValue={editingAuction.status}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado (Aguardando início)</SelectItem>
                    <SelectItem value="active">Ativo (Recebendo lances)</SelectItem>
                    <SelectItem value="finished">Finalizado (Encerrado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 font-bold" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AuctionManager;