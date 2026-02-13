"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Camera, Upload, FileText, 
  CheckCircle2, AlertCircle, ChevronLeft, Loader2,
  Image as ImageIcon, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const Verification = () => {
  const [docType, setDocType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!docType || !file) {
      toast({ 
        variant: "destructive", 
        title: "Campos incompletos", 
        description: "Selecione o tipo de documento e anexe uma foto." 
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Simulação de upload e atualização de status
      // Em produção, aqui faríamos o upload para o Supabase Storage
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_status: 'pending' })
        .eq('id', user.id);

      if (error) throw error;

      toast({ 
        title: "Documentos enviados!", 
        description: "Nossa equipe analisará seus documentos em até 24 horas." 
      });
      
      setTimeout(() => navigate('/app'), 2000);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao enviar", description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/app')}
          className="mb-6 text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft size={20} className="mr-1" /> Voltar ao Painel
        </Button>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-500 rounded-2xl">
                <ShieldCheck size={32} />
              </div>
              <div>
                <CardTitle className="text-2xl">Verificação de Identidade</CardTitle>
                <CardDescription className="text-slate-400">
                  Para sua segurança e conformidade com as regras de leilão.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-lg font-bold text-slate-900">1. Tipo de Documento</Label>
              <Select onValueChange={setDocType}>
                <SelectTrigger className="h-14 rounded-xl border-2 focus:border-orange-500">
                  <SelectValue placeholder="Selecione o documento que deseja enviar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnh">CNH (Carteira de Motorista)</SelectItem>
                  <SelectItem value="rg">RG (Identidade)</SelectItem>
                  <SelectItem value="passport">Passaporte</SelectItem>
                  <SelectItem value="cnpj">Cartão CNPJ (Empresas)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-bold text-slate-900">2. Foto do Documento</Label>
              
              {!preview ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-orange-300 transition-all group">
                    <Camera className="text-slate-400 group-hover:text-orange-500 mb-2" size={32} />
                    <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900">Tirar Foto</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                  </label>
                  
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-orange-300 transition-all group">
                    <Upload className="text-slate-400 group-hover:text-orange-500 mb-2" size={32} />
                    <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900">Galeria / Arquivo</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-orange-100">
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                  <button 
                    onClick={removeFile}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-3 text-white text-center text-sm font-medium">
                    {file?.name}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
              <AlertCircle className="text-blue-600 shrink-0" size={24} />
              <div className="text-sm text-blue-800 leading-relaxed">
                <p className="font-bold mb-1">Dicas para uma aprovação rápida:</p>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li>Certifique-se que a foto está nítida e sem reflexos.</li>
                  <li>O documento deve estar dentro da validade.</li>
                  <li>Todos os dados (nome, CPF, foto) devem estar visíveis.</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={handleUpload}
              disabled={isUploading || !file || !docType}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 rounded-2xl text-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" /> Enviando...
                </>
              ) : (
                'ENVIAR PARA ANÁLISE'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verification;