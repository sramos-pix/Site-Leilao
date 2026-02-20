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
      for (const row of previewData) {
        const rawCover = String(row.FotoCapa || row.foto_capa || "").trim();
        
        const lotData = {
          auction_id: selectedAuctionId,
          lot_number: parseInt(row.Lote || row.lote || 0),
          title: String(row.Titulo || row.titulo || row.Title || "").trim(),
          brand: String(row.Marca || row.marca || "").trim(),
          model: String(row.Modelo || row.modelo || "").trim(),
          year: parseInt(row.Ano || row.ano || 2024),
          mileage_km: parseInt(row.KM || row.km || 0),
          start_bid: parseFloat(row.LanceInicial || row.lance_inicial || 0),
          current_bid: parseFloat(row.LanceInicial || row.lance_inicial || 0),
          bid_increment: parseFloat(row.Incremento || row.incremento || 500),
          description: String(row.Descricao || row.descricao || "").trim(),
          cover_image_url: rawCover || null,
          status: 'active',
          transmission: String(row.Cambio || row.cambio || "Automático").trim(),
          fuel_type: String(row.Combustivel || row.combustivel || "Flex").trim()
        };

        const { data: newLot, error: lotError } = await supabase
          .from('lots')
          .insert(lotData)
          .select()
          .single();

        if (lotError) throw lotError;

        const galleryString = String(row.Galeria || row.galeria || "");
        if (galleryString && newLot) {
          const photoUrls = galleryString
            .split(/[;,]+/)
            .map((url: string) => url.trim())
            .filter(url => url.length > 10);
          
          if (photoUrls.length > 0) {
            const photosToInsert = photoUrls.map((url: string) => ({
              lot_id: newLot.id,
              public_url: url,
              is_cover: url === lotData.cover_image_url
            }));

            await supabase.from('lot_photos').insert(photosToInsert);
          }
        }
      }

      toast({ title: "Importação concluída!", description: `${previewData.length} veículos cadastrados.` });
      setIsOpen(false);
      setPreviewData([]);
      onSuccess();
    } catch (error: any) {
      console.error("Erro na importação:", error);
      toast({ variant: "destructive", title: "Erro na importação", description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const header = ["Lote", "Titulo", "Marca", "Modelo", "Ano", "KM", "LanceInicial", "Incremento", "Cambio", "Combustivel", "FotoCapa", "Galeria", "Descricao"];
    
    // Exemplo real baseado no link que você enviou
    const exampleRow = { 
      "Lote": 70, 
      "Titulo": "Fiat Punto SPORTING 1.8 2011", 
      "Marca": "Fiat", 
      "Modelo": "Punto", 
      "Ano": 2011, 
      "KM": 120000, 
      "LanceInicial": 15000, 
      "Incremento": 500, 
      "Cambio": "Manual",
      "Combustivel": "Flex",
      "FotoCapa": "https://guimaraeslimaleiloes.com/web/fotos/img1_1727377758954_959499.PNG",
      "Galeria": "https://guimaraeslimaleiloes.com/web/fotos/img1_1727377758954_959499.PNG, https://guimaraeslimaleiloes.com/web/fotos/img2_1727377758954_959499.PNG, https://guimaraeslimaleiloes.com/web/fotos/img3_1727377758954_959499.PNG, https://guimaraeslimaleiloes.com/web/fotos/img4_1727377758954_959499.PNG, https://guimaraeslimaleiloes.com/web/fotos/img5_1727377758954_959499.PNG",
      "Descricao": "Veículo em bom estado de conservação. Ar condicionado, direção hidráulica." 
    };

    const ws = XLSX.utils.json_to_sheet([exampleRow], { header });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Importar Veiculos");
    
    XLSX.writeFile(wb, "modelo_importacao_GUIMARAES.xlsx");
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
            <AlertTitle className="text-blue-900 font-bold">Como pegar as fotos</AlertTitle>
            <AlertDescription className="text-blue-700 text-xs">
              No site do leilão, clique com o botão direito na foto e escolha <b>"Copiar endereço da imagem"</b>. 
              Cole na coluna Galeria separando por vírgula. O sistema aceita links .PNG e .JPG.
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
                <Upload size={16} className="rotate-180" /> Download Modelo Guimarães
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

          <Button 
            onClick={processImport} 
            disabled={isImporting || previewData.length === 0 || !selectedAuctionId}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all"
          >
            {isImporting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
            CONFIRMAR IMPORTAÇÃO
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportLots;