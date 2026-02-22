"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Shield, Gavel, MessageSquare, TrendingUp, Clock, Percent, Phone, Mail, AppWindow, Paintbrush } from "lucide-react";
import AppearanceSettings from "@/components/admin/settings/AppearanceSettings";

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("geral");
  
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
    return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      
      {/* SUBMENU LATERAL ESQUERDO (Colado no menu principal) */}
      <div className="flex flex-col w-full md:w-64 space-y-2 shrink-0 bg-slate-900 p-6 border-l border-white/5">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Módulos</div>
        
        <Button
          variant="ghost"
          onClick={() => setActiveSection("geral")}
          className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${
            activeSection === "geral" 
              ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md" 
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <AppWindow size={18} className="mr-3" /> Informações Gerais
        </Button>

        <Button
          variant="ghost"
          onClick={() => setActiveSection("aparencia")}
          className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${
            activeSection === "aparencia" 
              ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md" 
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Paintbrush size={18} className="mr-3" /> Aparência
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => setActiveSection("regras")}
          className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${
            activeSection === "regras" 
              ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md" 
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Gavel size={18} className="mr-3" /> Regras de Leilão
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => setActiveSection("seguranca")}
          className={`w-full justify-start rounded-xl h-12 font-bold transition-all ${
            activeSection === "seguranca" 
              ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md" 
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Shield size={18} className="mr-3" /> Segurança e Funções
        </Button>
      </div>

      {/* ÁREA DE CONTEÚDO DIREITA */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Cabeçalho da Página */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configurações da Plataforma</h2>
              <p className="text-slate-500 mt-1">Gerencie as regras de negócio, taxas e funcionalidades do sistema.</p>
            </div>
            {activeSection !== "aparencia" && (
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-6 rounded-2xl font-black shadow-xl shadow-slate-200 transition-all active:scale-95 w-full md:w-auto"
              >
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                SALVAR TUDO
              </Button>
            )}
          </div>

          {/* SEÇÃO 1: INFORMAÇÕES GERAIS */}
          {activeSection === "geral" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
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
            </div>
          )}

          {/* SEÇÃO: APARÊNCIA */}
          {activeSection === "aparencia" && (
            <AppearanceSettings />
          )}

          {/* SEÇÃO 2: REGRAS DE LEILÃO */}
          {activeSection === "regras" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
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
            </div>
          )}

          {/* SEÇÃO 3: SEGURANÇA E FUNCIONALIDADES */}
          {activeSection === "seguranca" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 gap-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors gap-4">
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
                      <Switch 
                        checked={settings.require_kyc} 
                        onCheckedChange={(checked) => setSettings({...settings, require_kyc: checked})} 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors gap-4">
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
                      <Switch 
                        checked={settings.chat_enabled} 
                        onCheckedChange={(checked) => setSettings({...settings, chat_enabled: checked})} 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-red-50/50 rounded-2xl border border-red-100 hover:border-red-200 transition-colors gap-4">
                    <div className="space-y-2">
                      <Label className="text-lg font-bold text-red-700">Modo Manutenção</Label>
                      <p className="text-sm text-red-600/70 leading-relaxed max-w-md">
                        Bloqueia o acesso ao site para todos os usuários não-administradores. Útil para atualizações no sistema.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm font-bold text-red-400 uppercase">{settings.maintenance_mode ? 'Ativado' : 'Desativado'}</span>
                      <Switch 
                        checked={settings.maintenance_mode} 
                        onCheckedChange={(checked) => setSettings({...settings, maintenance_mode: checked})} 
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;