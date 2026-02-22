"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Shield, Gavel, MessageSquare, TrendingUp, Clock, Percent, Phone, Mail, AppWindow } from "lucide-react";

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    platform_name: "",
    support_email: "",
    support_phone: "",
    buyer_fee: 5,
    anti_sniping_time: 30,
    min_increment: 500,
    maintenance_mode: false,
    require_kyc: true,
    chat_enabled: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from("platform_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      if (data) {
        setSettings({
          platform_name: data.platform_name || "",
          support_email: data.support_email || "",
          support_phone: data.support_phone || "",
          buyer_fee: data.buyer_fee || 5,
          anti_sniping_time: data.anti_sniping_time || 30,
          min_increment: data.min_increment || 500,
          maintenance_mode: data.maintenance_mode || false,
          require_kyc: data.require_kyc !== false,
          chat_enabled: data.chat_enabled !== false
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("platform_settings")
        .update({
          platform_name: settings.platform_name,
          support_email: settings.support_email,
          support_phone: settings.support_phone,
          buyer_fee: settings.buyer_fee,
          anti_sniping_time: settings.anti_sniping_time,
          min_increment: settings.min_increment,
          maintenance_mode: settings.maintenance_mode,
          require_kyc: settings.require_kyc,
          chat_enabled: settings.chat_enabled,
          updated_at: new Date().toISOString()
        })
        .eq("id", 1);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As alterações foram aplicadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configurações da Plataforma</h2>
          <p className="text-slate-500 mt-1">Gerencie as regras de negócio, taxas e funcionalidades do sistema.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-6 rounded-2xl font-black shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          SALVAR TUDO
        </Button>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-16 mb-8 bg-slate-200/50 p-1.5 rounded-2xl">
          <TabsTrigger value="geral" className="rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">
            <AppWindow size={16} className="mr-2" /> Informações Gerais
          </TabsTrigger>
          <TabsTrigger value="regras" className="rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">
            <Gavel size={16} className="mr-2" /> Regras de Leilão
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all">
            <Shield size={16} className="mr-2" /> Segurança e Funcionalidades
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: INFORMAÇÕES GERAIS */}
        <TabsContent value="geral" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 flex items-center gap-2">
                  Nome da Plataforma
                </Label>
                <Input 
                  className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors text-base"
                  value={settings.platform_name} 
                  onChange={(e) => setSettings({...settings, platform_name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" /> E-mail de Suporte
                  </Label>
                  <Input 
                    className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors text-base"
                    value={settings.support_email} 
                    onChange={(e) => setSettings({...settings, support_email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <Phone size={16} className="text-slate-400" /> Telefone de Suporte
                  </Label>
                  <Input 
                    className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors text-base"
                    value={settings.support_phone} 
                    onChange={(e) => setSettings({...settings, support_phone: e.target.value})} 
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ABA 2: REGRAS DE LEILÃO */}
        <TabsContent value="regras" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <Percent size={16} className="text-slate-400" /> Taxa do Leiloeiro (%)
                  </Label>
                  <Input 
                    type="number" 
                    className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors text-base"
                    value={settings.buyer_fee} 
                    onChange={(e) => setSettings({...settings, buyer_fee: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" /> Anti-Sniping (segundos)
                  </Label>
                  <Input 
                    type="number" 
                    className="h-14 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors text-base"
                    value={settings.anti_sniping_time} 
                    onChange={(e) => setSettings({...settings, anti_sniping_time: Number(e.target.value)})} 
                  />
                  <p className="text-xs text-slate-400 italic">Tempo extra adicionado se houver lance no final.</p>
                </div>
              </div>

              <div className="space-y-3 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                <Label className="text-orange-600 font-bold flex items-center gap-2 text-lg">
                  <TrendingUp size={20} /> Incremento Mínimo Padrão (R$)
                </Label>
                <Input 
                  type="number" 
                  className="h-16 text-2xl font-black rounded-xl border-orange-200 focus:border-orange-500 bg-white text-orange-700"
                  value={settings.min_increment} 
                  onChange={(e) => setSettings({...settings, min_increment: Number(e.target.value)})} 
                />
                <p className="text-sm text-orange-600/80 italic font-medium">
                  Valor somado a cada novo lance. Pode ser sobrescrito individualmente em cada lote.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ABA 3: SEGURANÇA E FUNCIONALIDADES */}
        <TabsContent value="seguranca" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="space-y-3 mb-6">
                  <Label className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Shield size={20} className="text-emerald-500" /> Exigir KYC
                  </Label>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Obriga o envio de documentos (RG/CNH) e aprovação da administração para que o usuário possa dar lances.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                  <span className="text-sm font-bold text-slate-400 uppercase">{settings.require_kyc ? 'Ativado' : 'Desativado'}</span>
                  <Switch 
                    checked={settings.require_kyc} 
                    onCheckedChange={(checked) => setSettings({...settings, require_kyc: checked})} 
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="space-y-3 mb-6">
                  <Label className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare size={20} className="text-blue-500" /> Chat de Suporte
                  </Label>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Ativa o balão de chat flutuante no canto da tela para os usuários falarem diretamente com a administração.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                  <span className="text-sm font-bold text-slate-400 uppercase">{settings.chat_enabled ? 'Ativado' : 'Desativado'}</span>
                  <Switch 
                    checked={settings.chat_enabled} 
                    onCheckedChange={(checked) => setSettings({...settings, chat_enabled: checked})} 
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 bg-red-50/50 rounded-2xl border border-red-100 hover:border-red-200 transition-colors md:col-span-2">
                <div className="space-y-3 mb-6">
                  <Label className="text-lg font-bold text-red-700">Modo Manutenção</Label>
                  <p className="text-sm text-red-600/70 leading-relaxed">
                    Bloqueia o acesso ao site para todos os usuários não-administradores. Útil para atualizações no sistema.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-red-200/60">
                  <span className="text-sm font-bold text-red-400 uppercase">{settings.maintenance_mode ? 'Ativado' : 'Desativado'}</span>
                  <Switch 
                    checked={settings.maintenance_mode} 
                    onCheckedChange={(checked) => setSettings({...settings, maintenance_mode: checked})} 
                  />
                </div>
              </div>

            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;