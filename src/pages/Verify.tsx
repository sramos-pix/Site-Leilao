"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const Verify = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'success'>('idle');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo.");
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      // Tenta fazer o upload para o bucket 'kyc-documents'
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error("Configuração pendente: O bucket 'kyc-documents' não foi criado no Storage do Supabase.");
        }
        throw uploadError;
      }

      // Atualiza o status do perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          kyc_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setStatus('success');
      toast.success("Documento enviado com sucesso!");
      
      setTimeout(() => {
        navigate('/app');
      }, 3000);

    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(error.message || "Erro ao enviar documento.");
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
          <Button onClick={() => navigate('/app')} className="w-full bg-slate-900 rounded-xl">Voltar ao Painel</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-500 p-2 rounded-xl text-white">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Verificação de Identidade</h1>
        </div>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-8">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-orange-400" />
              Por que verificar?
            </CardTitle>
            <p className="text-slate-400 text-sm mt-2">
              Para garantir a segurança de todos os participantes, exigimos a verificação de documentos antes de permitir lances em leilões ativos.
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
                <Upload className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-600 font-medium">
                  {file ? file.name : "Clique ou arraste seu RG/CNH (Frente e Verso)"}
                </p>
                <p className="text-xs text-slate-400 mt-2">Formatos aceitos: JPG, PNG ou PDF (Máx 5MB)</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex gap-3">
                <AlertCircle className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Certifique-se de que a foto esteja nítida e todos os dados estejam legíveis. Documentos cortados ou desfocados serão rejeitados.
                </p>
              </div>

              <Button 
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg"
              >
                {isUploading ? (
                  <><Loader2 className="mr-2 animate-spin" /> Enviando...</>
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