"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { Paintbrush, Image as ImageIcon, Link as LinkIcon, Layout, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AppearanceSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  
  const [settings, setSettings] = useState({
    theme_color: "orange",
    logo_url: "",
    banner_url: "",
    banner_link: "",
    banner_active: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("theme_color, logo_url, banner_url, banner_link, banner_active")
      .single();

    if (data && !error) {
      setSettings({
        theme_color: data.theme_color || "orange",
        logo_url: data.logo_url || "",
        banner_url: data.banner_url || "",
        banner_link: data.banner_link || "",
        banner_active: data.banner_active || false,
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const setUploading = type === 'logo' ? setIsUploadingLogo : setIsUploadingBanner;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `settings/${fileName}`;

      // Tenta fazer o upload para um bucket chamado 'public'
      let { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      let bucketName = 'public';

      // Se falhar, tenta em um bucket chamado 'images' (comum em projetos Supabase)
      if (uploadError) {
        const { error: retryError } = await supabase.storage
          .from('images')
          .upload(filePath, file);
          
        if (retryError) throw retryError;
        bucketName = 'images';
      }

      // Pega a URL pública da imagem recém enviada
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Atualiza o estado com a nova URL
      setSettings(prev => ({ ...prev, [`${type}_url`]: publicUrl }));
      
      toast({
        title: "Upload concluído!",
        description: "A imagem foi enviada com sucesso. Não esqueça de salvar as alterações.",
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Verifique se existe um bucket chamado 'public' ou 'images' no seu Supabase Storage.",
      });
    } finally {
      setUploading(false);
      // Limpa o input para permitir enviar a mesma imagem novamente se necessário
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("platform_settings")
        .update({
          theme_color: settings.theme_color,
          logo_url: settings.logo_url,
          banner_url: settings.banner_url,
          banner_link: settings.banner_link,
          banner_active: settings.banner_active,
        })
        .eq("id", 1);

      if (error) throw error;
      
      toast({
        title: "Aparência salva!",
        description: "As configurações visuais foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar salvar as configurações.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-500">
      <div className="space-y-8">
        {/* Logotipo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center text-slate-800">
            <ImageIcon className="mr-2 h-5 w-5 text-orange-500" />
            Logotipo
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label>URL da Imagem do Logo</Label>
              <Input
                placeholder="https://exemplo.com/logo.png"
                value={settings.logo_url}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                className="bg-slate-50"
              />
            </div>
            
            <div className="relative w-full sm:w-auto shrink-0">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={(e) => handleFileUpload(e, 'logo')} 
                disabled={isUploadingLogo} 
              />
              <Button type="button" variant="outline" className="w-full sm:w-auto bg-white border-slate-200 hover:bg-slate-50" disabled={isUploadingLogo}>
                {isUploadingLogo ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-orange-500" /> : <Upload className="w-4 h-4 mr-2 text-slate-500" />}
                {isUploadingLogo ? "Enviando..." : "Subir Imagem"}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-slate-500">Deixe em branco para usar o texto padrão. Recomendado: PNG com fundo transparente.</p>
          
          {settings.logo_url && (
            <div className="p-4 bg-slate-100 rounded-xl inline-block border border-slate-200 shadow-inner">
              <img src={settings.logo_url} alt="Logo Preview" className="h-12 object-contain" />
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Banner Principal */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold flex items-center text-slate-800">
              <Layout className="mr-2 h-5 w-5 text-orange-500" />
              Banner da Página Inicial
            </h3>
            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <Switch
                checked={settings.banner_active}
                onCheckedChange={(checked) => setSettings({ ...settings, banner_active: checked })}
              />
              <Label className="cursor-pointer font-medium">{settings.banner_active ? "Banner Ativo" : "Banner Oculto"}</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 space-y-2 w-full">
                <Label>URL da Imagem do Banner</Label>
                <Input
                  placeholder="https://exemplo.com/banner.jpg"
                  value={settings.banner_url}
                  onChange={(e) => setSettings({ ...settings, banner_url: e.target.value })}
                  className="bg-slate-50"
                />
              </div>
              
              <div className="relative w-full sm:w-auto shrink-0">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  onChange={(e) => handleFileUpload(e, 'banner')} 
                  disabled={isUploadingBanner} 
                />
                <Button type="button" variant="outline" className="w-full sm:w-auto bg-white border-slate-200 hover:bg-slate-50" disabled={isUploadingBanner}>
                  {isUploadingBanner ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-orange-500" /> : <Upload className="w-4 h-4 mr-2 text-slate-500" />}
                  {isUploadingBanner ? "Enviando..." : "Subir Imagem"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500">Proporção recomendada: formato horizontal (ex: 1920x400 pixels).</p>

            <div className="space-y-2 pt-2">
              <Label className="flex items-center gap-2"><LinkIcon size={16} className="text-slate-400"/> Link do Banner (Opcional)</Label>
              <Input
                placeholder="https://exemplo.com/promocao"
                value={settings.banner_link}
                onChange={(e) => setSettings({ ...settings, banner_link: e.target.value })}
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Para onde o usuário será redirecionado ao clicar no banner.</p>
            </div>
          </div>

          {settings.banner_url && (
            <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
              <img src={settings.banner_url} alt="Banner Preview" className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Pré-visualização do Banner</span>
              </div>
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Cores */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center text-slate-800">
            <Paintbrush className="mr-2 h-5 w-5 text-orange-500" />
            Cor Principal do Site
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: "orange", color: "bg-orange-500", name: "Laranja" },
              { id: "blue", color: "bg-blue-600", name: "Azul" },
              { id: "green", color: "bg-emerald-600", name: "Verde" },
              { id: "red", color: "bg-red-600", name: "Vermelho" },
              { id: "purple", color: "bg-purple-600", name: "Roxo" },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSettings({ ...settings, theme_color: theme.id })}
                className={`flex flex-col items-center space-y-2 p-3 rounded-xl border-2 transition-all ${
                  settings.theme_color === theme.id 
                    ? "border-orange-500 bg-orange-50 shadow-sm scale-105" 
                    : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${theme.color} shadow-sm`} />
                <span className="text-xs font-bold text-slate-700">{theme.name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">A cor escolhida será aplicada instantaneamente em todos os botões, links e destaques da plataforma.</p>
        </div>
      </div>

      <div className="flex justify-start pt-6 mt-8 border-t border-slate-100">
        <Button onClick={handleSave} disabled={loading} className="bg-slate-900 hover:bg-orange-600 text-white px-10 py-6 rounded-xl font-bold shadow-md transition-all w-full sm:w-auto text-lg">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Paintbrush className="mr-2" />}
          SALVAR APARÊNCIA
        </Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;