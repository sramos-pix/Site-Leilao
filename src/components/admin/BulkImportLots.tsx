"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Loader2, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import { fetchFipeValue } from '@/lib/fipe';

interface BulkImportLotsProps {
  auctions: any[];
  onSuccess: () => void;
}

const BulkImportLots = ({ auctions, onSuccess }: BulkImportLotsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string>("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      setPreviewData(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!selectedAuctionId) {
      toast({ variant: "destructive", title: "Selecione um leilão", description: "É necessário vincular os veículos a um leilão." });
      return;
    }

    setIsImporting(true);
    let insertedCount = 0;
    let updatedCount = 0;

    try {
      console.log("[BulkImport] Iniciando processamento de", previewData.length, "linhas");
      
      for (const row of previewData) {
        const lotNumber = parseInt(row.Lote || row.lote || row["Número do Lote"] || 0);
        const lotIdFromCsv = row["ID do Lote"] || row.id || null;
        
        // Processamento robusto da data de encerramento
        const rawEndsAt = row.Encerramento || row.Data || row["Data de Encerramento"];
        let endsAtIso = null;

        if (rawEndsAt) {
          try {
            let date: Date | null = null;
            
            if (typeof rawEndsAt === 'string' && rawEndsAt.includes('/')) {
              // Formato BR: DD/MM/YYYY HH:mm:ss
              const parts = rawEndsAt.split(/[\s,]+/);
              const dateParts = parts[0].split('/');
              if (dateParts.length === 3) {
                const day = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]) - 1;
                const year = parseInt(dateParts[2]);
                
                let hours = 0, minutes = 0, seconds = 0;
                if (parts[1]) {
                  const timeParts = parts[1].split(':');
                  hours = parseInt(timeParts[0]) || 0;
                  minutes = parseInt(timeParts[1]) || 0;
                  seconds = parseInt(timeParts[2]) || 0;
                }
                date = new Date(year, month, day, hours, minutes, seconds);
              }
            } else if (typeof rawEndsAt === 'number') {
              // Formato Excel (número de série)
              date = new Date((rawEndsAt - 25569) * 86400 * 1000);
            } else {
              date = new Date(rawEndsAt);
            }

            if (date && !isNaN(date.getTime())) {
              endsAtIso = date.toISOString();
            }
          } catch (e) {
            console.error("[BulkImport] Erro ao processar data:", rawEndsAt, e);
          }
        }

        // Se não tem data, gera uma aleatória entre 3h e 24h no futuro
        const effectiveEndsAt = endsAtIso
          || new Date(Date.now() + (3 + Math.random() * 21) * 60 * 60 * 1000).toISOString();

        // Determina o status baseado na data
        const now = new Date();
        const newStatus = new Date(effectiveEndsAt) > now ? 'active' : 'finished';

        const descFromCsv = String(row.Descricao || row.descricao || "").trim();

        let startBid = parseFloat(row.LanceInicial || row["Lance Inicial"] || 0);

        const lotData: any = {
          auction_id: selectedAuctionId,
          lot_number: lotNumber,
          title: String(row.Titulo || row.titulo || row["Título"] || "").trim(),
          brand: String(row.Marca || row.marca || "").trim(),
          model: String(row.Modelo || row.modelo || "").trim(),
          year: parseInt(row.Ano || row.ano || 2024),
          mileage_km: parseInt(row.KM || row.km || row.Quilometragem || 0),
          start_bid: startBid,
          bid_increment: parseFloat(row.Incremento || 500),
          transmission: String(row.Cambio || row["Câmbio"] || "Automático").trim(),
          fuel_type: String(row.Combustivel || row["Combustível"] || "Flex").trim(),
          ends_at: effectiveEndsAt,
          status: newStatus
        };

        // FIPE: usa o valor do CSV se fornecido, senão busca automaticamente na API
        const fipeFromCsv = parseFloat(row.FIPE || row.Fipe || row["Valor FIPE"] || row.ValorFIPE || 0) || null;
        if (fipeFromCsv) {
          lotData.fipe_value = fipeFromCsv;
        } else {
          const fipeApi = await fetchFipeValue(lotData.brand, lotData.model, lotData.year);
          if (fipeApi) lotData.fipe_value = fipeApi;
        }

        // Se tiver "% Abaixo FIPE" no CSV, recalcula o lance inicial a partir da FIPE
        const pctAbaixo = parseFloat(row["% Abaixo FIPE"] || row["% Abaixo"] || row.PctAbaixoFIPE || 0);
        if (pctAbaixo > 0 && lotData.fipe_value) {
          lotData.start_bid = Math.round(lotData.fipe_value * (1 - pctAbaixo / 100));
        }

        // Só sobrescreve description se o CSV fornecer um valor
        if (descFromCsv) lotData.description = descFromCsv;

        // Busca o lote existente
        let existingLot = null;
        if (lotIdFromCsv) {
          const { data } = await supabase.from('lots').select('id').eq('id', lotIdFromCsv).maybeSingle();
          existingLot = data;
        }

        if (!existingLot && lotNumber > 0) {
          const { data } = await supabase.from('lots').select('id').eq('auction_id', selectedAuctionId).eq('lot_number', lotNumber).maybeSingle();
          existingLot = data;
        }

        if (existingLot) {
          const { error } = await supabase.from('lots').update(lotData).eq('id', existingLot.id);
          if (error) throw error;
          updatedCount++;
        } else {
          const { error } = await supabase.from('lots').insert(lotData);
          if (error) throw error;
          insertedCount++;
        }
      }

      toast({ 
        title: "Importação concluída!", 
        description: `${insertedCount} novos veículos e ${updatedCount} atualizados.` 
      });
      
      setIsDialogOpen(false);
      setPreviewData([]);
      onSuccess();
    } catch (error: any) {
      console.error("[BulkImport] Erro fatal:", error);
      toast({ variant: "destructive", title: "Erro na importação", description: error.message });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl gap-2 border-slate-200 text-slate-700 hover:bg-slate-50">
          <Upload size={18} />
          Importar Planilha
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="text-green-600" />
            Importar Veículos em Massa
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">1. Selecione o Leilão de Destino</label>
            <select 
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              value={selectedAuctionId}
              onChange={(e) => setSelectedAuctionId(e.target.value)}
            >
              <option value="">Selecione um leilão...</option>
              {auctions.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">2. Selecione o Arquivo (.xlsx ou .csv)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Clique para selecionar o arquivo</p>
                </div>
                <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {previewData.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-3 text-blue-700 text-sm">
              <CheckCircle2 size={18} />
              <span>{previewData.length} veículos detectados na planilha.</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            onClick={handleImport} 
            disabled={isImporting || previewData.length === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 font-bold"
          >
            {isImporting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
            Confirmar Importação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportLots;