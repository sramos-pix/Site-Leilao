"use client";

import React, { useState, useEffect } from 'react';
import { 
  Save, Globe, Mail, Phone, Percent, 
  Clock, DollarSign, CreditCard, Building, 
  ShieldAlert, Loader2, Settings2, Gavel, Wallet, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Estados simulados para as configurações
  const [settings, setSettings] = useState({
    platformName: 'AutoBid Leilões',
    supportEmail: 'suporte@autobid.com.br',
    supportPhone: '(11) 99999-9999',
    buyerFee: '5',
    antiSnipingTime: '30',
    minIncrement: '500',
    pixKey: '12.345.678/0001-90',
    pixName: 'AutoBid Pagamentos LTDA',
    bankName: 'Banco Inter',
    maintenanceMode: false,
    requireKyc: true
  });

  // Carrega as configurações do localStorage (simulando um banco de dados por enquanto)
  useEffect(() => {
    const savedSettings = localStorage.getItem('@autobid_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simula um tempo de salvamento no banco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('@autobid_settings', JSON.stringify(settings));
    
    toast({
      title: "Configurações salvas",
      description: "As alterações foram aplicadas com sucesso em toda a plataforma.",
    });
    setIsLoading(false);
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: Globe },
    { id: 'auctions', label: 'Regras de Leilão', icon: Gavel },
    { id: 'financial', label: 'Financeiro', icon: Wallet },
    { id: 'system', label: 'Sistema', icon: Settings2 },
  ];

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
                  <Input name="platformName" value={settings.platformName} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Mail size={14}/> E-mail de Suporte</Label>
                    <Input name="supportEmail" value={settings.supportEmail} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Phone size={14}/> WhatsApp de Contato</Label>
                    <Input name="supportPhone" value={settings.supportPhone} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
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
                    <Input name="buyerFee" type="number" value={settings.buyerFee} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                    <p className="text-[10px] text-slate-400">Porcentagem cobrada sobre o valor do arremate.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><DollarSign size={14}/> Incremento Mínimo (R$)</Label>
                    <Input name="minIncrement" type="number" value={settings.minIncrement} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                    <p className="text-[10px] text-slate-400">Valor mínimo para cobrir o lance anterior.</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Clock size={14}/> Tempo Anti-Sniping (Segundos)</Label>
                    <Input name="antiSnipingTime" type="number" value={settings.antiSnipingTime} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                    <p className="text-[10px] text-slate-400">Tempo adicionado ao cronômetro se houver lance nos últimos segundos.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ABA: FINANCEIRO */}
          {activeTab === 'financial' && (
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="text-orange-500" size={20} /> Dados de Recebimento
                </CardTitle>
                <CardDescription>Contas bancárias exibidas para os arrematantes realizarem o pagamento.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><CreditCard size={14}/> Chave PIX Oficial</Label>
                  <Input name="pixKey" value={settings.pixKey} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-mono" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Building size={14}/> Instituição Bancária</Label>
                    <Input name="bankName" value={settings.bankName} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><ShieldCheck size={14}/> Nome do Titular</Label>
                    <Input name="pixName" value={settings.pixName} onChange={handleChange} className="h-12 rounded-xl bg-slate-50 border-slate-200" />
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
                    <input type="checkbox" name="requireKyc" checked={settings.requireKyc} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                  <div>
                    <h4 className="font-bold text-red-900">Modo de Manutenção</h4>
                    <p className="text-xs text-red-700/70 mt-1">Bloqueia o acesso de usuários comuns ao site.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer" />
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
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 font-bold shadow-lg transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Salvar Configurações
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;