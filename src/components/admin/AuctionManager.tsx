"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Calendar, Loader2, Edit, Image as ImageIcon, Upload } from 'lucide-react';
import { uploadLotPhoto } from '@/lib/storage'; // Reutilizando a lógica de upload

const AuctionManager = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  const fetchAuctions = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('auctions')
      .select('*')
      .order('starts_at', { ascending: false });
    setAuctions(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleEdit = (auction: any) => {
    setEditingAuction(auction);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, auctionId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Usamos o ID do leilão ou um temporário se for novo
      const pathId = auctionId || 'temp-auction';
      const uploadResult = await uploadLotPhoto(pathId, file);
      
      if (auctionId) {
        // Se o leilão já existe, atualiza direto no banco
        const { error } = await supabase
          .from('auctions')
          .update({ image_url: uploadResult.publicUrl })
          .eq('id', auctionId);
        
        if (error) throw error;
        toast({ title: "Imagem atualizada!" });
        fetchAuctions();
      } else {
        // Se for um novo leilão sendo criado, guardamos a URL no estado do form
        setEditingAuction((prev: any) => ({ ...prev, image_url: uploadResult.publicUrl }));
        toast({ title: "Imagem carregada para o novo leilão" });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no upload", description: error.message });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const auctionData = {
      title: formData.get('title'),
      description: formData.get('description'),
      location: formData.get('location'),
      starts_at: new Date(formData.get('starts_at') as string).toISOString(),
      ends_at: new Date(formData.get('ends_at') as string).toISOString(),
      status: formData.get('status'),
      image_url: editingAuction?.image_url // Mantém a URL da imagem carregada
    };

    const { error } = editingAuction?.id 
      ? await supabase.from('auctions').update(auctionData).eq('id', editingAuction.id)
      : await supabase.from('auctions').insert(auctionData);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      toast({ title: "Sucesso!" });
      setIsDialogOpen(false);
      setEditingAuction(null);
      fetchAuctions();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Leilões</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingAuction(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
              <Plus size={18} className="mr-2" /> Novo Leilão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>{editingAuction?.id ? 'Editar Leilão' : 'Criar Novo Leilão'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Imagem de Capa</Label>
                <div className="flex flex-col items-center gap-4">
                  {editingAuction?.image_url && (
                    <img src={editingAuction.image_url} className="w-full h-32 object-cover rounded-xl border" alt="Preview" />
                  )}
                  <label className="w-full h-12 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
                    {uploadingImage ? <Loader2 className="animate-spin text-orange-500" /> : <Upload size={18} className="text-slate-400" />}
                    <span className="text-sm font-bold text-slate-500">Alterar Imagem</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, editingAuction?.id)} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" defaultValue={editingAuction?.title} className="rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input name="starts_at" type="datetime-local" defaultValue={editingAuction?.starts_at ? new Date(editingAuction.starts_at).toISOString().slice(0, 16) : ""} className="rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input name="ends_at" type="datetime-local" defaultValue={editingAuction?.ends_at ? new Date(editingAuction.ends_at).toISOString().slice(0, 16) : ""} className="rounded-xl" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Localização</Label>
                <Input name="location" defaultValue={editingAuction?.location} className="rounded-xl" placeholder="Ex: São Paulo, SP" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select name="status" defaultValue={editingAuction?.status || 'scheduled'} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm">
                  <option value="scheduled">Agendado</option>
                  <option value="live">Ao Vivo</option>
                  <option value="finished">Encerrado</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea name="description" defaultValue={editingAuction?.description} className="rounded-xl" />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl font-bold" disabled={isSubmitting || uploadingImage}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : editingAuction?.id ? 'Salvar Alterações' : 'Criar Leilão'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Capa</TableHead>
              <TableHead>Leilão</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : auctions.map((auction) => (
              <TableRow key={auction.id}>
                <TableCell>
                  <div className="w-16 h-10 rounded-lg bg-slate-100 overflow-hidden">
                    {auction.image_url ? (
                      <img src={auction.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-full h-full p-2 text-slate-300" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-bold">{auction.title}</TableCell>
                <TableCell className="text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold">{new Date(auction.starts_at).toLocaleDateString('pt-BR')}</span>
                    <span className="text-slate-400">{new Date(auction.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={auction.status === 'live' ? 'bg-red-500' : 'bg-blue-500'}>
                    {auction.status === 'live' ? 'AO VIVO' : auction.status === 'finished' ? 'ENCERRADO' : 'AGENDADO'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(auction)} className="text-blue-500"><Edit size={18} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if(confirm('Excluir?')) supabase.from('auctions').delete().eq('id', auction.id).then(() => fetchAuctions()); }} className="text-red-500"><Trash2 size={18} /></Button>
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