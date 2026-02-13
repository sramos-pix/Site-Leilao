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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Car, Loader2, Image as ImageIcon, CheckCircle2, X, Edit, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { uploadLotPhoto } from '@/lib/storage';

const LotManager = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedLot || !e.target.files) return;
    setIsSubmitting(true);
    
    try {
      for (const file of Array.from(e.target.files)) {
        try {
          const { storagePath, publicUrl } = await uploadLotPhoto(selectedLot.id, file);
          
          const isFirst = lotPhotos.length === 0;
          const { error: dbError } = await supabase.from('lot_photos').insert({
            lot_id: selectedLot.id,
            storage_path: storagePath,
            public_url: publicUrl,
            is_cover: isFirst
          });

          if (dbError) {
            if (dbError.message.includes('row-level security')) {
              throw new Error("Erro de Permissão (RLS): Você precisa configurar as políticas de acesso no SQL Editor do Supabase.");
            }
            throw dbError;
          }

          if (isFirst) {
            await supabase.from('lots').update({ cover_image_url: publicUrl }).eq('id', selectedLot.id);
          }
        } catch (uploadErr: any) {
          if (uploadErr.message?.includes('bucket_not_found')) {
            throw new Error("O bucket 'vehicle-photos' não foi encontrado no Storage.");
          }
          throw uploadErr;
        }
      }
      toast({ title: "Fotos enviadas!" });
      fetchLotPhotos(selectedLot.id);
      fetchData();
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro no upload", 
        description: error.message 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAsCover = async (photo: any) => {
    await supabase.from('lot_photos').update({ is_cover: false }).eq('lot_id', selectedLot.id);
    await supabase.from('lot_photos').update({ is_cover: true }).eq('id', photo.id);
    await supabase.from('lots').update({ cover_image_url: photo.public_url }).eq('id', selectedLot.id);
    fetchLotPhotos(selectedLot.id);
    fetchData();
  };

  const deletePhoto = async (photo: any) => {
    await supabase.from('lot_photos').delete().eq('id', photo.id);
    if (photo.is_cover) {
      await supabase.from('lots').update({ cover_image_url: null }).eq('id', selectedLot.id);
    }
    fetchLotPhotos(selectedLot.id);
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const lotData = {
      auction_id: formData.get('auction_id'),
      lot_number: parseInt(formData.get('lot_number') as string),
      title: formData.get('title'),
      brand: formData.get('brand'),
      model: formData.get('model'),
      year: parseInt(formData.get('year') as string),
      mileage_km: parseInt(formData.get('mileage_km') as string),
      start_bid: parseFloat(formData.get('start_bid') as string),
      ends_at: new Date(formData.get('ends_at') as string).toISOString(),
    };

    let error;
    if (editingLot) {
      const { error: updateError } = await supabase.from('lots').update(lotData).eq('id', editingLot.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('lots').insert(lotData);
      error = insertError;
    }

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      toast({ title: "Sucesso!" });
      setEditingLot(null);
      fetchData();
    }
    setIsSubmitting(false);
  };

  const formatForInput = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Veículos</h2>
        <Dialog onOpenChange={(open) => !open && setEditingLot(null)}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
              <Plus size={18} className="mr-2" /> Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-3xl">
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
              <div className="space-y-2"><Label>Marca</Label><Input name="brand" defaultValue={editingLot?.brand} required /></div>
              <div className="space-y-2"><Label>Modelo</Label><Input name="model" defaultValue={editingLot?.model} required /></div>
              <div className="space-y-2"><Label>Ano</Label><Input name="year" type="number" defaultValue={editingLot?.year} required /></div>
              <div className="space-y-2"><Label>KM</Label><Input name="mileage_km" type="number" defaultValue={editingLot?.mileage_km} required /></div>
              <div className="space-y-2"><Label>Lance Inicial</Label><Input name="start_bid" type="number" step="0.01" defaultValue={editingLot?.start_bid} required /></div>
              <div className="space-y-2"><Label>Encerramento</Label><Input name="ends_at" type="datetime-local" defaultValue={formatForInput(editingLot?.ends_at)} required /></div>
              <Button type="submit" className="col-span-2 bg-orange-500 mt-4" disabled={isSubmitting}>
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
              <TableHead>Lance Inicial</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : lots.map((lot) => (
              <TableRow key={lot.id}>
                <TableCell className="font-mono text-xs">#{lot.lot_number}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
                      {lot.cover_image_url ? <img src={lot.cover_image_url} className="w-full h-full object-cover" /> : <Car className="w-full h-full p-2 text-slate-300" />}
                    </div>
                    <span className="font-bold">{lot.title}</span>
                  </div>
                </TableCell>
                <TableCell className="font-bold">{formatCurrency(lot.start_bid)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog onOpenChange={(open) => { if(open) { setSelectedLot(lot); fetchLotPhotos(lot.id); } }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-blue-500"><ImageIcon size={18} /></Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl rounded-3xl">
                        <DialogHeader><DialogTitle>Fotos do Veículo: {lot.title}</DialogTitle></DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                            <AlertCircle className="text-blue-600 shrink-0" size={20} />
                            <div className="text-xs text-blue-800 leading-tight">
                              <p className="font-bold mb-1">Erro de RLS Detectado?</p>
                              <p>Se você receber erro de "Row-level security", execute o SQL de políticas no painel do Supabase.</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Plus className="w-8 h-8 text-slate-400 mb-2" />
                                <p className="text-sm text-slate-500">Clique para subir fotos</p>
                              </div>
                              <input type="file" multiple className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                            </label>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            {lotPhotos.map(photo => (
                              <div key={photo.id} className="relative group aspect-video rounded-xl overflow-hidden border">
                                <img src={photo.public_url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button size="icon" variant="ghost" className="text-white" onClick={() => setAsCover(photo)}>
                                    <CheckCircle2 className={photo.is_cover ? "text-green-400" : ""} />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="text-white hover:text-red-400" onClick={() => deletePhoto(photo)}>
                                    <X />
                                  </Button>
                                </div>
                                {photo.is_cover && <Badge className="absolute top-2 left-2 bg-green-500">CAPA</Badge>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog onOpenChange={(open) => open && setEditingLot(lot)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-500"><Edit size={18} /></Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl rounded-3xl">
                        <DialogHeader><DialogTitle>Editar Veículo</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
                          <div className="col-span-2 space-y-2">
                            <Label>Leilão Vinculado</Label>
                            <Select name="auction_id" defaultValue={lot.auction_id} required>
                              <SelectTrigger><SelectValue placeholder="Selecione o leilão" /></SelectTrigger>
                              <SelectContent>{auctions.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2"><Label>Lote #</Label><Input name="lot_number" type="number" defaultValue={lot.lot_number} required /></div>
                          <div className="space-y-2"><Label>Título</Label><Input name="title" defaultValue={lot.title} required /></div>
                          <div className="space-y-2"><Label>Marca</Label><Input name="brand" defaultValue={lot.brand} required /></div>
                          <div className="space-y-2"><Label>Modelo</Label><Input name="model" defaultValue={lot.model} required /></div>
                          <div className="space-y-2"><Label>Ano</Label><Input name="year" type="number" defaultValue={lot.year} required /></div>
                          <div className="space-y-2"><Label>KM</Label><Input name="mileage_km" type="number" defaultValue={lot.mileage_km} required /></div>
                          <div className="space-y-2"><Label>Lance Inicial</Label><Input name="start_bid" type="number" step="0.01" defaultValue={lot.start_bid} required /></div>
                          <div className="space-y-2"><Label>Encerramento</Label><Input name="ends_at" type="datetime-local" defaultValue={formatForInput(lot.ends_at)} required /></div>
                          <Button type="submit" className="col-span-2 bg-orange-500 mt-4" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="icon" onClick={() => { if(confirm('Excluir?')) supabase.from('lots').delete().eq('id', lot.id).then(() => fetchData()); }} className="text-red-500"><Trash2 size={18} /></Button>
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

export default LotManager;