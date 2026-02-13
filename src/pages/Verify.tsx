"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Upload, FileText, CheckCircle2, 
  AlertCircle, Loader2, Camera, ArrowLeft, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const Verify = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'pending' | 'verified' | 'rejected'>('idle');
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', user.id)
      .single();
    
    if (data) setStatus(data.kyc_status || 'idle');
  };

  React.useEffect(() => {
    checkStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          variant: "destructive",
          title: "Formato inválido",
          description: "Por favor, envie um arquivo PDF, JPEG ou PNG."
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          document_url: publicUrl,
          kyc_status: 'pending'
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Documento enviado!",
        description: "Seus dados estão em análise. Você será notificado em breve."
      });
      setStatus('pending');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no envio",
        description: error.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-xl rounded-3xl text-center p-8">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="animate-pulse" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Análise em Andamento</h2>
          <p className="text-slate-500 mb-8">
            Recebemos seu documento! Nossa equipe está revisando as informações. Isso costuma levar até 24h úteis.
          </p>
          <Button onClick={() => navigate('/app/dashboard')} className="w-full bg-slate-900 text-white rounded-xl">
            Voltar ao Painel
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/app/dashboard')}
          className="mb-6 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={20} className="mr-2" /> Voltar
        </Button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Verificação de Identidade</h1>
          <p className="text-slate-500 mt-2">Para participar dos leilões, precisamos validar seu documento (RG, CNH ou Passaporte).</p>
        </div>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg text-orange-500 shadow-sm">
                      <Camera size={18} />
                    </div>
                    <span className="font-bold text-sm">Foto Legível</span>
                  </div>
                  <p className="text-xs text-slate-500">Certifique-se de que todos os dados estão visíveis e sem reflexos.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg text-orange-500 shadow-sm">
                      <FileText size={18} />
                    </div>
                    <span className="font-bold text-sm">Formatos Aceitos</span>
                  </div>
                  <p className="text-xs text-slate-500">Aceitamos arquivos em PDF, PNG ou JPEG de até 10MB.</p>
                </div>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  id="doc-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,application/pdf"
                  capture="environment"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="doc-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-orange-300 transition-all group"
                >
                  {file ? (
                    <div className="text-center p-4">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <p className="font-bold text-slate-900 truncate max-w-[250px]">{file.name}</p>
                      <p className="text-sm text-slate-500">Clique para trocar o arquivo</p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-16 h-16 bg-white text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:text-orange-500 transition-colors">
                        <Upload size={32} />
                      </div>
                      <p className="font-bold text-slate-900">Clique para enviar ou tirar foto</p>
                      <p className="text-sm text-slate-500 mt-1">PDF, PNG ou JPEG</p>
                    </div>
                  )}
                </label>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-100 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar para Análise'
                )}
              </Button>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl text-blue-700">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Seus dados são criptografados e armazenados com segurança de acordo com a LGPD. Utilizamos essas informações apenas para fins de verificação de identidade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;