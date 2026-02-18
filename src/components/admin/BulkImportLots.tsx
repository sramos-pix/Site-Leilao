"use client";

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { FileSpreadsheet, Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BulkImportLotsProps {
  auctions: any[];
  onSuccess: () => void;
}

const BulkImportLots = ({ auctions, onSuccess }: BulkImportLotsProps) => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setPreviewData(data);
    };
    reader.readAsBinaryString(file);
  };

  const processImport = async () => {
    if (!selectedAuctionId) {
      toast({ variant: "destructive", title: "Selecione um leilão", description: "É necessário vincular os veículos a um evento." });
      return;
    }

    if (previewData.length === 0) return;

    setIsImporting(true);
    try {
      const lotsToInsert = previewData.map((row: any) => ({
        auction_id: selectedAuctionId,
        lot_number: parseInt(row.Lote || row.lote || 0),
        title: row.Titulo || row.titulo || row.Title || "",
        brand: row.Marca || row.marca || "",
        model: row.Modelo || row.modelo || "",
        year: parseInt(row.Ano || row.ano || 2024),
        mileage_km: parseInt(row.KM || row.km || 0),
        start_bid: parseFloat(row.LanceInicial || row.lance_inicial || 0),
        current_bid: parseFloat(row.LanceInicial || row.lance_inicial || 0),
        bid_increment: parseFloat(row.Incremento || row.incremento || 500),
        description: row.Descricao || row.descricao || "",
        status: 'active',
        transmission: row.Cambio || row.cambio || "Automático",
        fuel_type: row.Combustivel || row.combustivel || "Flex"
      }));

      const { error } = await supabase.from('lots').insert(lotsToInsert);

      if (error) throw error;

      toast({ title: "Importação concluída!", description: `${lotsToInsert.length} veículos cadastrados.` });
      setIsOpen(false);
      setPreviewData([]);
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro na importação", description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { Lote: 1, Titulo: "Toyota Corolla XEi", Marca: "Toyota", Modelo: "Corolla", Ano: 2023, KM: 15000, LanceInicial: 85000, Incremento: 1000, Cambio: "Automático", Combustivel: "Flex", Descricao: "Veículo impecável" },
      { Lote: 2, Titulo: "Honda Civic Touring", Marca: "Honda", Modelo: "Civic", Ano: 2022, KM: 22000, LanceInicial: 95000, Incremento: 1000, Cambio: "Automático", Combustivel: "Gasolina", Descricao: "Único dono" }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "modelo_importacao_autobid.xlsx");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-slate-200 gap-2 font-bold">
          <FileSpreadsheet size={18} className="text-emerald-600" /> Importar Planilha
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>Importação em Massa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Alert className="bg-blue-50 border-blue-100 rounded-2xl">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900 font-bold">Instruções</AlertTitle>
            <AlertDescription className="text-blue-700 text-xs">
              Use os nomes das colunas exatamente como no modelo: <b>Lote, Titulo, Marca, Modelo, Ano, KM, LanceInicial, Incremento, Cambio, Combustivel, Descricao</b>.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">1. Vincular ao Leilão</label>
              <select 
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold focus:bg-white outline-none transition-all"
                value={selectedAuctionId}
                onChange={(e) => setSelectedAuctionId(e.target.value)}
              >
                <option value="">Selecione o evento...</option>
                {auctions.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">2. Baixar Modelo</label>
              <Button variant="secondary" onClick={downloadTemplate} className="w-full h-12 rounded-xl font-bold gap-2">
                <Upload size={16} className="rotate-180" /> Download Excel
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase">3. Selecionar Arquivo</label>
            <div className="relative h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileSpreadsheet size={32} className="text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-500">
                {previewData.length > 0 ? `${previewData.length} linhas detectadas` : "Clique ou arraste sua planilha aqui"}
              </p>
            </div>
          </div>

          {previewData.length > 0 && (
            <div className="max-h-40 overflow-y-auto border rounded-xl p-2 bg-slate-50">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-slate-100">
                  <tr>
                    <th className="p-1 text-left">Lote</th>
                    <th className="p-1 text-left">Título</th>
                    <th className="p-1 text-left">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-1">{row.Lote || row.lote}</td>
                      <td className="p-1">{row.Titulo || row.titulo}</td>
                      <td className="p-1">{row.LanceInicial || row.lance_inicial}</td>
                    </tr>
                  ))}
                  {previewData.length > 5 && <tr><td colSpan={3} className="text-center p-1 text-slate-400">... e mais {previewData.length - 5} itens</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          <Button 
            onClick={processImport} 
            disabled={isImporting || previewData.length === 0 || !selectedAuctionId}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all"
          >
            {isImporting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
            CONFIRMAR IMPORTAÇÃO DE {previewData.length} ITENS
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportLots;