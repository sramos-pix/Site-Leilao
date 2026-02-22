"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Settings, Shield, Gavel, MessageSquare } from "lucide-react";

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
          chat_enabled: data.chat_enabled !== false // Pega o valor do banco (padrão true)
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Configurações da Plataforma</h2>
        <p className="text-slate-500">Gerencie as regras de negócio e funcionalidades do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Gerais */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><Settings size={20} /></div>
            <h3 className="font-bold text-lg text-slate-900">Informações Gerais</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">Nome da Plataforma</Label>
              <Input 
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                value={settings.platform_name} 
                onChange={(e) => setSettings({...settings, platform_name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">E-mail de Suporte</Label>
              <Input 
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                value={settings.support_email} 
                onChange={(e) => setSettings({...settings, support_email: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">Telefone de Suporte</Label>
              <Input 
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                value={settings.support_phone} 
                onChange={(e) => setSettings({...settings, support_phone: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {/* Regras de Leilão */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><Gavel size={20} /></div>
            <h3 className="font-bold text-lg text-slate-900">Regras de Leilão</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">Taxa do Leiloeiro (%)</Label>
              <Input 
                type="number" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                value={settings.buyer_fee} 
                onChange={(e) => setSettings({...settings, buyer_fee: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">Tempo Anti-Sniping (segundos)</Label>
              <Input 
                type="number" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                value={settings.anti_sniping_time} 
                onChange={(e) => setSettings({...settings, anti_sniping_time: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">Incremento Mínimo Padrão (R$)</Label>
              <Input 
                type="number" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
                value={settings.min_increment} 
                onChange={(e) => setSettings({...settings, min_increment: Number(e.target.value)})} 
              />
            </div>
          </div>
        </div>

        {/* Segurança e Funcionalidades */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><Shield size={20} /></div>
            <h3 className="font-bold text-lg text-slate-900">Segurança e Funcionalidades</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <Label className="text-base font-bold text-slate-900">Exigir KYC</Label>
                <p className="text-xs text-slate-500">Obrigar envio de documentos</p>
              </div>
              <Switch 
                checked={settings.require_kyc} 
                onCheckedChange={(checked) => setSettings({...settings, require_kyc: checked})} 
              />
            </div>

            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <Label className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare size={16} className="text-orange-500" /> Chat de Suporte
                </Label>
                <p className="text-xs text-slate-500">Ativar chat para os usuários</p>
              </div>
              <Switch 
                checked={settings.chat_enabled} 
                onCheckedChange={(checked) => setSettings({...settings, chat_enabled: checked})} 
              />
            </div>

            <div className="flex items-center justify-between p-5 bg-red-50 rounded-2xl border border-red-100">
              <div className="space-y-1">
                <Label className="text-base font-bold text-red-700">Modo Manutenção</Label>
                <p className="text-xs text-red-500/80">Bloquear acesso ao site</p>
              </div>
              <Switch 
                checked={settings.maintenance_mode} 
                onCheckedChange={(checked) => setSettings({...settings, maintenance_mode: checked})} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-2xl font-black text-lg shadow-lg shadow-orange-200 transition-all active:scale-95"
        >
          {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          SALVAR CONFIGURAÇÕES
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;