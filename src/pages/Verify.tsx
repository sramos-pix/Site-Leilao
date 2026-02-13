"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, AlertCircle, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const Verify = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'success'>('idle');
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

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo primeiro.");
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Enviando documento...");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Você precisa estar logado para enviar documentos.");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Pegar URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Atualizar Perfil (Removida a coluna updated_at que causava erro)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          kyc_status: 'pending',
          document_url: publicUrl
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      toast.dismiss(loadingToast);
      toast.success("Documento enviado para análise!");
      setStatus('success');
      
      setTimeout(() => {
        navigate('/app');
      }, 3000);

    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Erro no processo:", error);
      toast.error(error.message || "Erro ao processar envio.");
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-xl rounded-3xl text-center p-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Documento Enviado!</h2>
          <p className="text-slate-500 mb-8">Estamos analisando seus dados. Você será redirecionado em instantes.</p>
          <Button onClick={() => navigate('/app')} className="w-full bg-slate-900 rounded-xl h-12">
            Voltar ao Painel Agora
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/app')} 
          className="mb-6 text-slate-500 hover:bg-white rounded-xl"
        >
          <ChevronLeft size={20} className="mr-1" /> Voltar ao Painel
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-200">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Verificação de Identidade</h1>
        </div>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-orange-400" />
              Envio de Documento
            </CardTitle>
            <p className="text-slate-400 text-sm mt-2">
              Seu documento será armazenado de forma segura para validação da sua conta.
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-orange-500 transition-colors cursor-pointer relative min-h-[240px] flex flex-col items-center justify-center bg-slate-50/50">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  disabled={isUploading}
                />
                {preview ? (
                  <div className="w-full h-full flex flex-col items-center">
                    <img src={preview} alt="Preview" className="max-h-48 rounded-lg mb-4 shadow-md border-4 border-white" />
                    <p className="text-sm font-medium text-slate-700">{file?.name}</p>
                    <p className="text-xs text-slate-400 mt-1">Clique para trocar o arquivo</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <Upload className="text-orange-500" size={32} />
                    </div>
                    <p className="text-slate-700 font-semibold">Clique para selecionar seu RG ou CNH</p>
                    <p className="text-xs text-slate-400 mt-2">Formatos: JPG, PNG ou PDF (Máx 5MB)</p>
                  </>
                )}
              </div>

              <Button 
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    <span>Processando...</span>
                  </div>
                ) : (
                  "Enviar para Análise"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;