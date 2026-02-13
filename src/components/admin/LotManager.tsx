"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Car, Loader2, Image as ImageIcon, Edit, CheckCircle2, Star, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { uploadLotPhoto } from '@/lib/storage';

const LotManager = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [editingLot, setEditingLot] = useState<any>(null);
  const [lotPhotos, setLotPhotos] = useState<any[]>([]);
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

  const fetchLotPhotos = async (lotId: string) => {
    const { data } = await supabase
      .from('lot_photos')
      .select('*')
      .eq('lot_id', lotId)
      .order('is_cover', { ascending: false });
    setLotPhotos(data || []);
  };

  const handleEdit = (lot: any) => {
    setEditingLot(lot);
    setIsDialogOpen(true);
  };

  const handleManagePhotos = (lot: any) => {
    setSelectedLot(lot);
    fetchLotPhotos(lot.id);
    setIsPhotoDialogOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedLot || !e.target.files || e.target.files.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const files = Array.from(e.target.files);
      for (const file of files) {
        let uploadResult = await uploadLotPhoto(selectedLot.id, file);
        const isFirst = lotPhotos.length === 0;
        await supabase.from('lot_photos').insert({
          lot_id: selectedLot.id,
          storage_path: uploadResult.storagePath,
          public_url: uploadResult.publicUrl,
          is_cover: isFirst
        });
        if (isFirst) {
          await supabase.from('lots').update({ cover_image_url: uploadResult.publicUrl }).eq('id', selectedLot.id);
        }
      }
      toast({ title: "Upload concluído!" });
      fetchLotPhotos(selectedLot.id);
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no upload", description: error.message });
    } finally {
      setIsSubmitting(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const lotData: any = {
      auction_id: formData.get('auction_id'),
      lot_number: parseInt(formData.get('lot_number') as string),
      title: formData.get('title'),
      brand: formData.get('brand'),
      model: formData.get('model'),
      year: parseInt(formData.get('year') as string),
      mileage_km: parseInt(formData.get('mileage_km') as string),
      start_bid: parseFloat(formData.get('start_bid') as string),
      bid_increment: parseFloat(formData.get('bid_increment') as string) || 500,
      description: formData.get('description'),
      ends_at: new Date(formData.get('ends_at') as string).toISOString(),
      is_featured: formData.get('is_featured') === 'on',
      is_weekly_highlight: formData.get('is_weekly_highlight') === 'on',
    };

    const { error } = editingLot 
      ? await supabase.from('lots').update(lotData).eq('id', editingLot.id)
      : await supabase.from('lots').insert(lotData);

    if (error) {
      if (error.message.includes('bid_increment')) {
        toast({ 
          variant: "destructive", 
          title: "Erro de Banco de Dados", 
          description: "A coluna 'bid_increment' não existe. Por favor, execute o comando SQL no painel do Supabase." 
        });
      } else {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      }
    } else {
      toast({ title: "Sucesso!" });
      setIsDialogOpen(false);
      setEditingLot(null);
      fetchData();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Veículos</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingLot(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
              <Plus size={18} className="mr-2" /> Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingLot ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label>Leilão Vinculado</Label>
                <Select name="auction_id" defaultValue={editingLot?.auction_id} required>
                  <SelectTrigger><SelectValue placeholder="Selecione o leilão" /></SelectTrigger>
                  <SelectContent>{auctions.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Lote #</Label><Input name="lot_number" type="number" defaultValue={editingLot?.lot_number} required /></div>
              <div className="space-y-2"><Label>Título</Label><Input name="title" defaultValue={editingLot?.title} required /></div>
              
              <div className="col-span-2 grid grid-cols-2 gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col">
                    <Label className="text-orange-900 font-bold flex items-center gap-2">
                      <Star size={14} /> Lote em Destaque
                    </Label>
                    <span className="text-[10px] text-orange-700">Aparece na Home</span>
                  </div>
                  <Switch name="is_featured" defaultChecked={editingLot?.is_featured} />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col">
                    <Label className="text-orange-900 font-bold flex items-center gap-2">
                      <Calendar size={14} /> Destaque da Semana
                    </Label>
                    <span className="text-[10px] text-orange-700">Banner principal</span>
                  </div>
                  <Switch name="is_weekly_highlight" defaultChecked={editingLot?.is_weekly_highlight} />
                </div>
              </div>

              <div className="space-y-2"><Label>Marca</Label><Input name="brand" defaultValue={editingLot?.brand} required /></div>
              <div className="space-y-2"><Label>Modelo</Label><Input name="model" defaultValue={editingLot?.model} required /></div>
              <div className="space-y-2"><Label>Ano</Label><Input name="year" type="number" defaultValue={editingLot?.year} required /></div>
              <div className="space-y-2"><Label>KM</Label><Input name="mileage_km" type="number" defaultValue={editingLot?.mileage_km} required /></div>
              
              <div className="space-y-2">
                <Label>Lance Inicial</Label>
                <Input name="start_bid" type="number" step="0.01" defaultValue={editingLot?.start_bid} required />
              </div>
              
              <div className="space-y-2">
                <Label className="text-orange-600 font-bold flex items-center gap-2">
                  <TrendingUp size={14} /> Incremento Mínimo
                </Label>
                <Input 
                  name="bid_increment" 
                  type="number" 
                  step="0.01" 
                  defaultValue={editingLot?.bid_increment || 500} 
                  className="border-orange-200 focus:border-orange-500"
                  required 
                />
              </div>

              <div className="col-span-2 space-y-2"><Label>Encerramento</Label><Input name="ends_at" type="datetime-local" defaultValue={editingLot?.ends_at ? new Date(editingLot.ends_at).toISOString().slice(0, 16) : ""} required /></div>
              
              <div className="col-span-2 space-y-2">
                <Label>Descrição Detalhada</Label>
                <Textarea name="description" defaultValue={editingLot?.description} placeholder="Detalhes do veículo..." className="min-h-[100px] rounded-xl" />
              </div>
              <Button type="submit" className="col-span-2 bg-orange-500 mt-4 py-6 rounded-2xl font-bold" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : editingLot ? 'Salvar Alterações' : 'Cadastrar Veículo'}
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
              <TableHead>Status</TableHead>
              <TableHead>Lance Inicial</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : lots.map((lot) => (
              <TableRow key={lot.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-mono text-xs">
                  <Link 
                    to={`/lots/${lot.id}`} 
                    target="_blank"
                    className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold"
                  >
                    #{lot.lot_number}
                    <ExternalLink size={10} />
                  </Link>
                </TableCell>
                <TableCell>
                  <Link 
                    to={`/lots/${lot.id}`} 
                    target="_blank"
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {lot.cover_image_url ? <img src={lot.cover_image_url} className="w-full h-full object-cover" /> : <Car className="w-full h-full p-2 text-slate-300" />}
                    </div>
                    <span className="font-bold group-hover:text-orange-600 transition-colors">{lot.title}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {lot.is_featured && <Badge className="bg-orange-100 text-orange-600 border-none text-[10px]">Destaque</Badge>}
                    {lot.is_weekly_highlight && <Badge className="bg-blue-100 text-blue-600 border-none text-[10px]">Semana</Badge>}
                  </div>
                </TableCell>
                <TableCell className="font-bold">{formatCurrency(lot.start_bid)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleManagePhotos(lot)} className="text-orange-500"><ImageIcon size={18} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(lot)} className="text-blue-500"><Edit size={18} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if(confirm('Excluir?')) supabase.from('lots').delete().eq('id', lot.id).then(() => fetchData()); }} className="text-red-500"><Trash2 size={18} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-3xl rounded-3xl">
          <DialogHeader><DialogTitle>Fotos do Lote: {selectedLot?.title}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Clique para enviar fotos</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handlePhotoUpload} disabled={isSubmitting} />
              </label>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {lotPhotos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100">
                  <img src={photo.public_url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={async () => {
                      await supabase.from('lot_photos').delete().eq('id', photo.id);
                      fetchLotPhotos(selectedLot.id);
                    }}><Trash2 size={14} /></Button>
                    {!photo.is_cover && (
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={async () => {
                        await supabase.from('lot_photos').update({ is_cover: false }).eq('lot_id', selectedLot.id);
                        await supabase.from('lot_photos').update({ is_cover: true }).eq('id', photo.id);
                        await supabase.from('lots').update({ cover_image_url: photo.public_url }).eq('id', selectedLot.id);
                        fetchLotPhotos(selectedLot.id);
                        fetchData();
                      }}><CheckCircle2 size={14} /></Button>
                    )}
                  </div>
                  {photo.is_cover && <Badge className="absolute top-2 left-2 bg-orange-500">Capa</Badge>}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LotManager;