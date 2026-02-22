"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Shield, Gavel, MessageSquare, TrendingUp, Clock, Percent, Phone, Mail, AppWindow, Paintbrush } from "lucide-react";
import AppearanceSettings from "@/components/admin/settings/AppearanceSettings";

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
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
      setActiveModal(null); // Fecha o modal após salvar
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
    { id: 'geral', title: 'Informações Gerais', desc: 'Nome da plataforma e contatos de suporte.', icon: AppWindow, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'aparencia', title: 'Aparência e Cores', desc: 'Logotipo, banners e cor principal do site.', icon: Paintbrush, color: 'text-pink-500', bg: 'bg-pink-50' },
    { id: 'regras', title: 'Regras de Leilão', desc: 'Taxas, incrementos e sistema anti-sniping.', icon: Gavel, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'seguranca', title: 'Segurança e Acesso', desc: 'Verificação KYC, Chat e Modo Manutenção.', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-full min-h-[60vh]"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configurações da Plataforma</h2>
        <p className="text-slate-500 mt-2 text-lg">Selecione um módulo abaixo para gerenciar as preferências.</p>
      </div>

      {/* GRID DE CARDS (HUB) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map(mod => (
          <Card
            key={mod.id}
            className="border-none shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 rounded-[2rem] overflow-hidden group bg-white"
            onClick={() => setActiveModal(mod.id)}
          >
            <CardContent className="p-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${mod.bg} ${mod.color}`}>
                <mod.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{mod.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{mod.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL FLUTUANTE COM O CONTEÚDO */}
      <Dialog open={!!activeModal} onOpenChange={(open) => { if (!open) setActiveModal(null); }}>
        <DialogContent className="max-w-2xl rounded-[2rem] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900">
                {activeModal && (() => {
                  const mod = modules.find(m => m.id === activeModal);
                  if (!mod) return null;
                  const Icon = mod.icon;
                  return (
                    <>
                      <div className={`p-2.5 rounded-xl ${mod.bg} ${mod.color}`}>
                        <Icon size={24} />
                      </div>
                      {mod.title}
                    </>
                  );
                })()}
              </DialogTitle>
            </DialogHeader>

            {/* CONTEÚDO: INFORMAÇÕES GERAIS */}
            {activeModal === 'geral' && (
              <div className="space-y-6">
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
            {activeModal === 'aparencia' && (
              <div className="-mt-6">
                <AppearanceSettings />
              </div>
            )}

            {/* CONTEÚDO: REGRAS DE LEILÃO */}
            {activeModal === 'regras' && (
              <div className="space-y-8">
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
            {activeModal === 'seguranca' && (
              <div className="grid grid-cols-1 gap-4">
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
            {activeModal !== 'aparencia' && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-6 rounded-xl font-bold shadow-md transition-all w-full sm:w-auto text-lg"
                >
                  {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                  SALVAR ALTERAÇÕES
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;