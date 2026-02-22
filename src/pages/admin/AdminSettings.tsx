"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Shield, Gavel, MessageSquare, TrendingUp, Clock, Percent, Phone, Mail, AppWindow, Paintbrush } from "lucide-react";
import AppearanceSettings from "@/components/admin/settings/AppearanceSettings";

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("geral");
  
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

  const modules = [
    { id: 'geral', title: 'Geral', desc: 'Nome e contatos', icon: AppWindow, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500' },
    { id: 'aparencia', title: 'Aparência', desc: 'Logos e cores', icon: Paintbrush, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-500' },
    { id: 'regras', title: 'Regras', desc: 'Taxas e lances', icon: Gavel, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-500' },
    { id: 'seguranca', title: 'Segurança', desc: 'KYC e acessos', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-500' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-full min-h-[60vh]"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
  }

  const activeModule = modules.find(m => m.id === activeSection);
  const ActiveIcon = activeModule?.icon || AppWindow;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configurações da Plataforma</h2>
        <p className="text-slate-500 mt-2 text-base">Selecione um módulo abaixo para gerenciar as preferências.</p>
      </div>

      {/* GRID DE CARDS (HUB) - Mais delicado e compacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {modules.map(mod => {
          const isActive = activeSection === mod.id;
          return (
            <Card
              key={mod.id}
              className={`transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden group ${
                isActive 
                  ? `ring-2 ring-offset-1 shadow-sm bg-slate-50 ${mod.border.replace('border-', 'ring-')}` 
                  : 'border-slate-200 shadow-sm hover:shadow-md bg-white hover:-translate-y-0.5'
              }`}
              onClick={() => setActiveSection(mod.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${mod.bg} ${mod.color}`}>
                  <mod.icon size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{mod.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ÁREA DE CONTEÚDO (Abaixo dos cards) */}
      {activeModule && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
          
          {/* Cabeçalho da Seção Ativa */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className={`p-3 rounded-xl ${activeModule.bg} ${activeModule.color}`}>
              <ActiveIcon size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{activeModule.title}</h3>
              <p className="text-slate-500 text-sm mt-1">Gerencie as configurações deste módulo abaixo.</p>
            </div>
          </div>

          {/* CONTEÚDO: INFORMAÇÕES GERAIS */}
          {activeSection === 'geral' && (
            <div className="space-y-6 max-w-3xl">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Nome da Plataforma</Label>
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
          )}

          {/* CONTEÚDO: APARÊNCIA */}
          {activeSection === 'aparencia' && (
            <div className="-mt-4">
              <AppearanceSettings />
            </div>
          )}

          {/* CONTEÚDO: REGRAS DE LEILÃO */}
          {activeSection === 'regras' && (
            <div className="space-y-8 max-w-3xl">
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
          )}

          {/* CONTEÚDO: SEGURANÇA E FUNÇÕES */}
          {activeSection === 'seguranca' && (
            <div className="grid grid-cols-1 gap-4 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-200 gap-4">
                <div className="space-y-2">
                  <Label className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Shield size={20} className="text-emerald-500" /> Exigir KYC
                  </Label>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                    Obriga o envio de documentos (RG/CNH) e aprovação da administração para que o usuário possa dar lances.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-bold text-slate-400 uppercase">{settings.require_kyc ? 'Ativado' : 'Desativado'}</span>
                  <Switch checked={settings.require_kyc} onCheckedChange={(checked) => setSettings({...settings, require_kyc: checked})} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-200 gap-4">
                <div className="space-y-2">
                  <Label className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare size={20} className="text-blue-500" /> Chat de Suporte
                  </Label>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                    Ativa o balão de chat flutuante no canto da tela para os usuários falarem diretamente com a administração.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-bold text-slate-400 uppercase">{settings.chat_enabled ? 'Ativado' : 'Desativado'}</span>
                  <Switch checked={settings.chat_enabled} onCheckedChange={(checked) => setSettings({...settings, chat_enabled: checked})} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-red-50/50 rounded-2xl border border-red-100 gap-4">
                <div className="space-y-2">
                  <Label className="text-lg font-bold text-red-700">Modo Manutenção</Label>
                  <p className="text-sm text-red-600/70 leading-relaxed max-w-md">
                    Bloqueia o acesso ao site para todos os usuários não-administradores. Útil para atualizações no sistema.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-bold text-red-400 uppercase">{settings.maintenance_mode ? 'Ativado' : 'Desativado'}</span>
                  <Switch checked={settings.maintenance_mode} onCheckedChange={(checked) => setSettings({...settings, maintenance_mode: checked})} />
                </div>
              </div>
            </div>
          )}

          {/* BOTÃO SALVAR (Oculto na aba de aparência pois ela tem o próprio botão) */}
          {activeSection !== 'aparencia' && (
            <div className="mt-10 pt-8 border-t border-slate-100 flex justify-start">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-slate-900 hover:bg-orange-600 text-white px-10 py-6 rounded-xl font-bold shadow-md transition-all w-full sm:w-auto text-lg"
              >
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                SALVAR ALTERAÇÕES
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;