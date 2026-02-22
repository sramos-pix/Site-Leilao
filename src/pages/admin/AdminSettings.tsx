"use client";

import React, { useState, useEffect } from 'react';
import { 
  Save, Globe, Mail, Phone, Percent, 
  Clock, DollarSign, ShieldAlert, Loader2, 
  Settings2, Gavel
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Estados para as configurações
  const [settings, setSettings] = useState({
    platform_name: '',
    support_email: '',
    support_phone: '',
    buyer_fee: '5',
    anti_sniping_time: '30',
    min_increment: '500',
    maintenance_mode: false,
    require_kyc: true
  });

  // Busca as configurações do Supabase ao carregar a página
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) throw error;
        
        if (data) {
          setSettings({
            platform_name: data.platform_name || '',
            support_email: data.support_email || '',
            support_phone: data.support_phone || '',
            buyer_fee: data.buyer_fee?.toString() || '5',
            anti_sniping_time: data.anti_sniping_time?.toString() || '30',
            min_increment: data.min_increment?.toString() || '500',
            maintenance_mode: data.maintenance_mode || false,
            require_kyc: data.require_kyc || false
          });
        }
      } catch (error: any) {
        console.error("Erro ao buscar configurações:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar as configurações." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          platform_name: settings.platform_name,
          support_email: settings.support_email,
          support_phone: settings.support_phone,
          buyer_fee: Number(settings.buyer_fee),
          anti_sniping_time: Number(settings.anti_sniping_time),
          min_increment: Number(settings.min_increment),
          maintenance_mode: settings.maintenance_mode,
          require_kyc: settings.require_kyc,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As alterações foram aplicadas com sucesso no banco de dados.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: Globe },
    { id: 'auctions', label: 'Regras de Leilão', icon: Gavel },
    { id: 'system', label: 'Sistema', icon: Settings2 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configurações da Plataforma</h1>
        <p className="text-slate-500 mt-1">Gerencie as regras globais, taxas e informações do sistema.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Menu Lateral de Configurações */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-400'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Configurações */}
        <div className="flex-1 space-y-6">
          
          {/* ABA: GERAL */}
          {activeTab === 'general' && (
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="text-orange-500" size={20} /> Informações Públicas
                </CardTitle>
                <CardDescription>Dados que aparecem para os usuários no rodapé e contatos.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Nome da Plataforma</Label>
                  <Input name="platform_name" value={settings.platform_name} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Mail size={14}/> E-mail de Suporte</Label>
                    <Input name="support_email" value={settings.support_email} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Phone size={14}/> WhatsApp de Contato</Label>
                    <Input name="support_phone" value={settings.support_phone} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ABA: LEILÕES */}
          {activeTab === 'auctions' && (
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gavel className="text-orange-500" size={20} /> Regras Padrão
                </CardTitle>
                <CardDescription>Defina as taxas e comportamentos automáticos dos leilões.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Percent size={14}/> Taxa do Leiloeiro (%)</Label>
                    <Input name="buyer_fee" type="number" value={settings.buyer_fee} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                    <p className="text-[10px] text-slate-400">Porcentagem cobrada sobre o valor do arremate.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><DollarSign size={14}/> Incremento Mínimo Padrão (R$)</Label>
                    <Input name="min_increment" type="number" value={settings.min_increment} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                    <p className="text-[10px] text-slate-400">Usado apenas caso o veículo não tenha um incremento específico cadastrado.</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Clock size={14}/> Tempo Anti-Sniping (Segundos)</Label>
                    <Input name="anti_sniping_time" type="number" value={settings.anti_sniping_time} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                    <p className="text-[10px] text-slate-400">Tempo adicionado ao cronômetro se houver lance nos últimos segundos.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ABA: SISTEMA */}
          {activeTab === 'system' && (
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden border-red-100">
              <CardHeader className="bg-red-50 border-b border-red-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                  <ShieldAlert className="text-red-600" size={20} /> Controles Críticos
                </CardTitle>
                <CardDescription className="text-red-600/70">Atenção ao alterar estas configurações.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="font-bold text-slate-900">Exigir Verificação de Documentos (KYC)</h4>
                    <p className="text-xs text-slate-500 mt-1">Usuários só podem dar lances após aprovação de CNH/RG.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="require_kyc" checked={settings.require_kyc} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                  <div>
                    <h4 className="font-bold text-red-900">Modo de Manutenção</h4>
                    <p className="text-xs text-red-700/70 mt-1">Bloqueia o acesso de usuários comuns ao site.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="maintenance_mode" checked={settings.maintenance_mode} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-red-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

              </CardContent>
            </Card>
          )}

          {/* BOTÃO SALVAR */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 font-bold shadow-lg transition-all active:scale-95"
            >
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Salvar Configurações
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;