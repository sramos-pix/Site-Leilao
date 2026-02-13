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
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Arquivo muito grande", description: "O limite é 5MB." });
        return;
      }
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
      toast({ variant: "destructive", title: "Campos incompletos" });
      return;
    }

    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Upload do arquivo para o Storage (Pasta por usuário)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Pegar a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Salvar a URL no perfil do usuário
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          kyc_status: 'pending',
          document_url: publicUrl 
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({ title: "Documentos enviados!", description: "Análise em andamento." });
      setTimeout(() => navigate('/app'), 2000);
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao enviar", 
        description: "Verifique se as políticas de Storage (RLS) foram configuradas no Supabase." 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/app')} className="mb-6">
          <ChevronLeft size={20} className="mr-1" /> Voltar
        </Button>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
            <CardTitle>Verificação de Identidade</CardTitle>
            <CardDescription className="text-slate-400">Envie uma foto nítida do seu documento para liberar lances.</CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label>1. Tipo de Documento</Label>
              <Select onValueChange={setDocType}>
                <SelectTrigger className="h-14 rounded-xl">
                  <SelectValue placeholder="Selecione o documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnh">CNH</SelectItem>
                  <SelectItem value="rg">RG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>2. Foto do Documento</Label>
              {!preview ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <Camera size={32} className="text-slate-400 mb-2" />
                    <span className="text-sm font-bold">Tirar Foto</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                  </label>
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload size={32} className="text-slate-400 mb-2" />
                    <span className="text-sm font-bold">Galeria</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-orange-100 shadow-inner">
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                  <button 
                    onClick={removeFile} 
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            <Button 
              onClick={handleUpload}
              disabled={isUploading || !file || !docType}
              className="w-full bg-orange-500 hover:bg-orange-600 py-8 rounded-2xl text-xl font-bold shadow-lg shadow-orange-100 transition-all"
            >
              {isUploading ? <Loader2 className="animate-spin" /> : 'ENVIAR PARA ANÁLISE'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verification;