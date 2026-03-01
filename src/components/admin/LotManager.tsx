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
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Car, Loader2, Image as ImageIcon, Edit, CheckCircle2, Star, Calendar, TrendingUp, ExternalLink, Settings2, Fuel, Search, Download, Filter, X, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { uploadLotPhoto } from '@/lib/storage';
import BulkImportLots from './BulkImportLots';

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedAuction, setSelectedAuction] = useState<string>("all");
  const [timeStatus, setTimeStatus] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { toast } = useToast();

  // Extrair marcas e modelos únicos para os filtros
  const brands = Array.from(new Set(lots.map(lot => lot.brand).filter(Boolean))).sort();
  
  // Modelos disponíveis baseados na marca selecionada
  const availableModels = Array.from(
    new Set(
      lots
        .filter(lot => selectedBrand === "all" || lot.brand === selectedBrand)
        .map(lot => lot.model)
        .filter(Boolean)
    )
  ).sort();

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

  // Filtra os lotes com base na busca e filtros
  const filteredLots = lots.filter(lot => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      lot.title?.toLowerCase().includes(searchLower) ||
      lot.brand?.toLowerCase().includes(searchLower) ||
      lot.model?.toLowerCase().includes(searchLower) ||
      lot.lot_number?.toString().includes(searchLower)
    );

    const matchesBrand = selectedBrand === "all" || lot.brand === selectedBrand;
    const matchesModel = selectedModel === "all" || lot.model === selectedModel;
    const matchesAuction = selectedAuction === "all" || lot.auction_id === selectedAuction;

    // Filtro de Status Temporal
    let matchesTime = true;
    if (timeStatus !== "all") {
      if (!lot.ends_at) {
        matchesTime = false;
      } else {
        const now = new Date();
        const endsAt = new Date(lot.ends_at);
        
        if (timeStatus === "finished") {
          matchesTime = endsAt < now;
        } else if (timeStatus === "ending_soon") {
          const diffHours = (endsAt.getTime() - now.getTime()) / (1000 * 60 * 60);
          matchesTime = diffHours > 0 && diffHours <= 24;
        } else if (timeStatus === "active") {
          matchesTime = endsAt > now;
        }
      }
    }

    return matchesSearch && matchesBrand && matchesModel && matchesAuction && matchesTime;
  });

  const clearFilters = () => {
    setSelectedBrand("all");
    setSelectedModel("all");
    setSelectedAuction("all");
    setTimeStatus("all");
    setSearchTerm("");
  };

  const toggleSelectAll = () => {
    const filteredIds = filteredLots.map(l => l.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      // Remove os visíveis da seleção
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Adiciona os visíveis à seleção
      const newIds = new Set([...selectedIds, ...filteredIds]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Deseja excluir permanentemente os ${selectedIds.length} veículos selecionados?`)) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('lots').delete().in('id', selectedIds);
      if (error) throw error;
      
      toast({ title: "Exclusão concluída!", description: `${selectedIds.length} veículos removidos.` });
      setSelectedIds([]);
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredLots.length === 0) {
      toast({ title: "Nenhum veículo para exportar", variant: "destructive" });
      return;
    }

    // Cabeçalhos do CSV
    const headers = [
      "ID do Lote",
      "Leilão",
      "Número do Lote",
      "Título",
      "Marca",
      "Modelo",
      "Ano",
      "Quilometragem",
      "Câmbio",
      "Combustível",
      "Lance Inicial",
      "Incremento",
      "Destaque Home",
      "Destaque Semana",
      "Data de Encerramento"
    ];

    // Mapeia os dados para o formato CSV
    const csvData = filteredLots.map(lot => {
      const auctionName = auctions.find(a => a.id === lot.auction_id)?.title || 'Desconhecido';
      
      return [
        lot.id,
        `"${auctionName}"`,
        lot.lot_number,
        `"${lot.title || ''}"`,
        `"${lot.brand || ''}"`,
        `"${lot.model || ''}"`,
        lot.year || '',
        lot.mileage_km || '',
        lot.transmission || '',
        lot.fuel_type || '',
        lot.start_bid || 0,
        lot.bid_increment || 500,
        lot.is_featured ? 'Sim' : 'Não',
        lot.is_weekly_highlight ? 'Sim' : 'Não',
        lot.ends_at ? new Date(lot.ends_at).toLocaleString('pt-BR') : ''
      ].join(';'); // Usando ponto e vírgula para melhor compatibilidade com Excel em PT-BR
    });

    // Junta cabeçalhos e dados
    const csvContent = [headers.join(';'), ...csvData].join('\n');
    
    // Adiciona BOM para garantir que o Excel leia os caracteres especiais (acentos) corretamente
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `veiculos_exportados_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Exportação concluída!", description: `${filteredLots.length} veículos exportados.` });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedLot || !e.target.files || e.target.files.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const files = Array.from(e.target.files);
      let hasCover = lotPhotos.some(p => p.is_cover);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let uploadResult = await uploadLotPhoto(selectedLot.id, file);
        
        const isCover = !hasCover && i === 0;

        await supabase.from('lot_photos').insert({
          lot_id: selectedLot.id,
          storage_path: uploadResult.storagePath,
          public_url: uploadResult.publicUrl,
          is_cover: isCover
        });

        if (isCover) {
          await supabase.from('lots').update({ cover_image_url: uploadResult.publicUrl }).eq('id', selectedLot.id);
          hasCover = true;
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
    
    const endsAtValue = formData.get('ends_at') as string;

    const lotData: any = {
      auction_id: formData.get('auction_id'),
      lot_number: parseInt(formData.get('lot_number') as string),
      title: formData.get('title'),
      brand: formData.get('brand'),
      model: formData.get('model'),
      year: parseInt(formData.get('year') as string),
      mileage_km: parseInt(formData.get('mileage_km') as string),
      transmission: formData.get('transmission') === "none" ? null : formData.get('transmission'),
      fuel_type: formData.get('fuel_type') === "none" ? null : formData.get('fuel_type'),
      start_bid: parseFloat(formData.get('start_bid') as string),
      bid_increment: parseFloat(formData.get('bid_increment') as string) || 500,
      description: formData.get('description'),
      ends_at: endsAtValue ? new Date(endsAtValue).toISOString() : null,
      is_featured: formData.get('is_featured') === 'on',
      is_weekly_highlight: formData.get('is_weekly_highlight') === 'on',
    };

    const { error } = editingLot 
      ? await supabase.from('lots').update(lotData).eq('id', editingLot.id)
      : await supabase.from('lots').insert(lotData);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
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
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-slate-900">Gerenciar Veículos</h2>
          {selectedIds.length > 0 && (
            <span className="text-xs font-bold text-orange-600">{selectedIds.length} selecionados</span>
          )}
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isSubmitting}
              className="rounded-xl gap-2 animate-in fade-in slide-in-from-right-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
              Excluir Selecionados
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="rounded-xl gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download size={18} />
            Exportar CSV
          </Button>
          <BulkImportLots auctions={auctions} onSuccess={fetchData} />
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
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione o leilão" /></SelectTrigger>
                    <SelectContent>{auctions.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2"><Label>Lote #</Label><Input name="lot_number" type="number" defaultValue={editingLot?.lot_number} className="rounded-xl" required /></div>
                <div className="space-y-2"><Label>Título</Label><Input name="title" defaultValue={editingLot?.title} className="rounded-xl" required /></div>
                
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

                <div className="space-y-2"><Label>Marca</Label><Input name="brand" defaultValue={editingLot?.brand} className="rounded-xl" required /></div>
                <div className="space-y-2"><Label>Modelo</Label><Input name="model" defaultValue={editingLot?.model} className="rounded-xl" required /></div>
                <div className="space-y-2"><Label>Ano</Label><Input name="year" type="number" defaultValue={editingLot?.year} className="rounded-xl" required /></div>
                <div className="space-y-2"><Label>KM</Label><Input name="mileage_km" type="number" defaultValue={editingLot?.mileage_km} className="rounded-xl" required /></div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Settings2 size={14} /> Câmbio</Label>
                  <Select name="transmission" defaultValue={editingLot?.transmission || "none"}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione o câmbio" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não informado</SelectItem>
                      <SelectItem value="Automático">Automático</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                      <SelectItem value="Automatizado">Automatizado</SelectItem>
                      <SelectItem value="Semi-Automático">Semi-Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Fuel size={14} /> Combustível</Label>
                  <Select name="fuel_type" defaultValue={editingLot?.fuel_type || "none"}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione o combustível" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não informado</SelectItem>
                      <SelectItem value="Flex">Flex</SelectItem>
                      <SelectItem value="Gasolina">Gasolina</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Etanol">Etanol</SelectItem>
                      <SelectItem value="Híbrido">Híbrido</SelectItem>
                      <SelectItem value="Elétrico">Elétrico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lance Inicial</Label>
                  <Input name="start_bid" type="number" step="0.01" defaultValue={editingLot?.start_bid} className="rounded-xl" required />
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
                    className="border-orange-200 focus:border-orange-500 rounded-xl"
                    required 
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Encerramento (Opcional)</Label>
                  <Input name="ends_at" type="datetime-local" defaultValue={editingLot?.ends_at ? new Date(editingLot.ends_at).toISOString().slice(0, 16) : ""} className="rounded-xl" />
                  <p className="text-[10px] text-slate-400 italic">Deixe em branco para usar o tempo aleatório de até 24h.</p>
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label>Descrição Detalhada</Label>
                  <Textarea name="description" defaultValue={editingLot?.description} placeholder="Detalhes do veículo..." className="min-h-[100px] rounded-xl" />
                </div>
                <Button type="submit" className="col-span-2 bg-orange-500 hover:bg-orange-600 mt-4 py-6 rounded-2xl font-bold text-white" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : editingLot ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              placeholder="Buscar por lote, título, marca ou modelo (ex: moto, honda, civic)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white text-base"
            />
          </div>
          <Button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            variant={isFilterOpen || selectedBrand !== "all" || selectedModel !== "all" || selectedAuction !== "all" || timeStatus !== "all" ? "default" : "outline"}
            className={cn(
              "h-12 rounded-xl gap-2 font-bold transition-all px-6",
              (isFilterOpen || selectedBrand !== "all" || selectedModel !== "all" || selectedAuction !== "all" || timeStatus !== "all")
                ? "bg-orange-500 hover:bg-orange-600 text-white border-none"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            )}
          >
            <Filter size={18} />
            Filtros
            {(selectedBrand !== "all" || selectedModel !== "all" || selectedAuction !== "all" || timeStatus !== "all") && (
              <Badge className="ml-1 bg-white/20 text-white hover:bg-white/30 border-none px-1.5 py-0.5 text-[10px]">
                Ativos
              </Badge>
            )}
          </Button>
        </div>

        {/* Painel de Filtros Expandido */}
        {isFilterOpen && (
          <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Filter size={16} className="text-orange-500" />
                Filtros Avançados
              </h3>
              {(selectedBrand !== "all" || selectedModel !== "all" || selectedAuction !== "all" || timeStatus !== "all" || searchTerm !== "") && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-red-500 h-8 px-2 text-xs font-bold">
                  <X size={14} className="mr-1" /> Limpar Filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Leilão</label>
                <select
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  value={selectedAuction}
                  onChange={(e) => setSelectedAuction(e.target.value)}
                >
                  <option value="all">Todos os Leilões</option>
                  {auctions.map(auction => (
                    <option key={auction.id} value={auction.id}>{auction.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Marca</label>
                <select
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setSelectedModel("all"); // Reseta o modelo ao trocar a marca
                  }}
                >
                  <option value="all">Todas as Marcas</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Modelo</label>
                <select
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={selectedBrand === "all" && availableModels.length === 0}
                >
                  <option value="all">Todos os Modelos</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Temporal</label>
                <select
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  value={timeStatus}
                  onChange={(e) => setTimeStatus(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Em Andamento</option>
                  <option value="ending_soon">Encerra em 24h</option>
                  <option value="finished">Encerrados</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-slate-500 font-medium pt-2 border-t border-slate-100 mt-2">
          {filteredLots.length} {filteredLots.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={filteredLots.length > 0 && filteredLots.every(lot => selectedIds.includes(lot.id))}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lance Inicial</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : filteredLots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  Nenhum veículo encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : filteredLots.map((lot) => {
              const isFinished = lot.ends_at && new Date(lot.ends_at) < new Date();
              const isEndingSoon = lot.ends_at && !isFinished && (new Date(lot.ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60) <= 24;

              return (
                <TableRow key={lot.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(lot.id) ? 'bg-orange-50/30' : ''} ${isFinished ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(lot.id)}
                      onCheckedChange={() => toggleSelect(lot.id)}
                    />
                  </TableCell>
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
                      <div className="flex flex-col">
                        <span className="font-bold group-hover:text-orange-600 transition-colors">{lot.title}</span>
                        <span className="text-[10px] text-slate-400">{lot.transmission || 'N/I'} • {lot.fuel_type || 'N/I'}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {isFinished ? (
                        <Badge className="bg-red-100 text-red-600 border-none text-[10px] flex items-center gap-1">
                          <AlertCircle size={10} /> Encerrado
                        </Badge>
                      ) : isEndingSoon ? (
                        <Badge className="bg-amber-100 text-amber-600 border-none text-[10px] flex items-center gap-1 animate-pulse">
                          <Clock size={10} /> Encerra em breve
                        </Badge>
                      ) : null}
                      {lot.is_featured && <Badge className="bg-orange-100 text-orange-600 border-none text-[10px]">Destaque</Badge>}
                      {lot.is_weekly_highlight && <Badge className="bg-blue-100 text-blue-600 border-none text-[10px]">Semana</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{formatCurrency(lot.start_bid)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleManagePhotos(lot)} title="Gerenciar Fotos" className="text-orange-500"><ImageIcon size={18} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(lot)} title="Editar Veículo" className="text-blue-500"><Edit size={18} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if(confirm('Excluir?')) supabase.from('lots').delete().eq('id', lot.id).then(() => fetchData()); }} title="Excluir" className="text-red-500"><Trash2 size={18} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-3xl rounded-3xl max-h-[90vh] overflow-y-auto">
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