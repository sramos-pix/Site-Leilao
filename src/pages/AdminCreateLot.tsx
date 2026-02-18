"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Save, Loader2, Car, 
  Gauge, Calendar, Settings2, Fuel,
  FileText, Hash, DollarSign, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';

const AdminCreateLot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lot_number: '',
    year: new Date().getFullYear().toString(),
    mileage_km: '',
    transmission: 'Automático',
    fuel_type: 'Flex',
    start_bid: '',
    bid_increment: '1000',
    ends_at: '',
    cover_image_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('lots')
        .insert([{
          ...formData,
          year: parseInt(formData.year),
          mileage_km: parseInt(formData.mileage_km),
          start_bid: parseFloat(formData.start_bid),
          bid_increment: parseFloat(formData.bid_increment),
          current_bid: parseFloat(formData.start_bid),
          ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
          status: 'active'
        }]);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Lote criado com sucesso!" });
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro ao criar lote", 
        description: error.message 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 text-slate-500 font-bold hover:text-orange-600"
        >
          <ChevronLeft size={16} className="mr-1" /> VOLTAR
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-8 text-white">
              <h1 className="text-3xl font-black flex items-center gap-3">
                <Car className="text-orange-500" /> NOVO VEÍCULO
              </h1>
              <p className="text-slate-400 mt-2">Preencha as informações técnicas do lote.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Título do Veículo</Label>
                  <Input 
                    required 
                    placeholder="Ex: Toyota Corolla 2.0 XEi 2023"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="rounded-2xl border-slate-200 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Número do Lote</Label>
                  <Input 
                    required 
                    placeholder="Ex: 001"
                    value={formData.lot_number}
                    onChange={e => setFormData({...formData, lot_number: e.target.value})}
                    className="rounded-2xl border-slate-200 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <Calendar size={14} /> Ano
                  </Label>
                  <Input 
                    type="number" 
                    required 
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: e.target.value})}
                    className="rounded-2xl border-slate-200 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <Gauge size={14} /> KM
                  </Label>
                  <Input 
                    type="number" 
                    required 
                    placeholder="0"
                    value={formData.mileage_km}
                    onChange={e => setFormData({...formData, mileage_km: e.target.value})}
                    className="rounded-2xl border-slate-200 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <Settings2 size={14} /> Câmbio
                  </Label>
                  <Select 
                    value={formData.transmission} 
                    onValueChange={val => setFormData({...formData, transmission: val})}
                  >
                    <SelectTrigger className="rounded-2xl border-slate-200 h-12">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automático">Automático</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                      <SelectItem value="Semi-Automático">Semi-Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <Fuel size={14} /> Motor
                  </Label>
                  <Select 
                    value={formData.fuel_type} 
                    onValueChange={val => setFormData({...formData, fuel_type: val})}
                  >
                    <SelectTrigger className="rounded-2xl border-slate-200 h-12">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flex">Flex</SelectItem>
                      <SelectItem value="Gasolina">Gasolina</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Híbrido">Híbrido</SelectItem>
                      <SelectItem value="Elétrico">Elétrico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <DollarSign size={14} /> Lance Inicial (R$)
                  </Label>
                  <Input 
                    type="number" 
                    required 
                    value={formData.start_bid}
                    onChange={e => setFormData({...formData, start_bid: e.target.value})}
                    className="rounded-2xl border-slate-200 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <TrendingUp size={14} /> Incremento (R$)
                  </Label>
                  <Input 
                    type="number" 
                    required 
                    value={formData.bid_increment}
                    onChange={e => setFormData({...formData, bid_increment: e.target.value})}
                    className="rounded-2xl border-slate-200 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <Calendar size={14} /> Data de Término (Opcional)
                  </Label>
                  <Input 
                    type="datetime-local" 
                    value={formData.ends_at}
                    onChange={e => setFormData({...formData, ends_at: e.target.value})}
                    className="rounded-2xl border-slate-200 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">URL da Imagem de Capa</Label>
                <Input 
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={formData.cover_image_url}
                  onChange={e => setFormData({...formData, cover_image_url: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Descrição Detalhada</Label>
                <Textarea 
                  placeholder="Descreva o estado do veículo, opcionais, etc."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="rounded-2xl border-slate-200 min-h-[150px]"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-16 rounded-2xl text-lg font-black shadow-lg shadow-orange-100"
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                SALVAR LOTE
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateLot;