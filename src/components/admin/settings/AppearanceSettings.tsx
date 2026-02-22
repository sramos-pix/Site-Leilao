"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { Paintbrush, Image as ImageIcon, Link as LinkIcon, Layout } from "lucide-react";

const AppearanceSettings = () => {
  const [loading, setLoading] = useState(false);
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
      alert("Configurações de aparência salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar configurações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Aparência do Site</h2>
        <p className="text-slate-500">Personalize o visual, logotipo e banners da plataforma.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8">
        {/* Logotipo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center text-slate-800">
            <ImageIcon className="mr-2 h-5 w-5 text-orange-500" />
            Logotipo
          </h3>
          <div className="space-y-2">
            <Label>URL da Imagem do Logo</Label>
            <Input
              placeholder="https://exemplo.com/logo.png"
              value={settings.logo_url}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            />
            <p className="text-xs text-slate-500">Deixe em branco para usar o texto padrão. Recomendado: PNG com fundo transparente.</p>
          </div>
          {settings.logo_url && (
            <div className="p-4 bg-slate-100 rounded-lg inline-block border border-slate-200">
              <img src={settings.logo_url} alt="Logo Preview" className="h-10 object-contain" />
            </div>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Banner Principal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center text-slate-800">
              <Layout className="mr-2 h-5 w-5 text-orange-500" />
              Banner da Página Inicial
            </h3>
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <Switch
                checked={settings.banner_active}
                onCheckedChange={(checked) => setSettings({ ...settings, banner_active: checked })}
              />
              <Label className="cursor-pointer">{settings.banner_active ? "Banner Ativo" : "Banner Oculto"}</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>URL da Imagem do Banner</Label>
              <Input
                placeholder="https://exemplo.com/banner.jpg"
                value={settings.banner_url}
                onChange={(e) => setSettings({ ...settings, banner_url: e.target.value })}
              />
              <p className="text-xs text-slate-500">Proporção recomendada: formato horizontal (ex: 1920x400 pixels).</p>
            </div>

            <div className="space-y-2">
              <Label>Link do Banner (Opcional)</Label>
              <Input
                placeholder="https://exemplo.com/promocao"
                value={settings.banner_link}
                onChange={(e) => setSettings({ ...settings, banner_link: e.target.value })}
              />
              <p className="text-xs text-slate-500">Para onde o usuário será redirecionado ao clicar no banner.</p>
            </div>
          </div>

          {settings.banner_url && (
            <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <img src={settings.banner_url} alt="Banner Preview" className="w-full h-32 object-cover" />
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
                  settings.theme_color === theme.id ? "border-orange-500 bg-orange-50" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${theme.color} shadow-sm`} />
                <span className="text-xs font-medium text-slate-700">{theme.name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">A cor escolhida será aplicada instantaneamente em todos os botões, links e destaques da plataforma.</p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white px-8">
          {loading ? "Salvando..." : "Salvar Aparência"}
        </Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;