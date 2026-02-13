"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, Plus, X, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const CreateLot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    lot_number: '',
    start_bid: '',
    year: '',
    mileage_km: '',
    description: '', // Novo campo
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('lots')
        .insert([{
          title: formData.title,
          lot_number: parseInt(formData.lot_number),
          start_bid: parseFloat(formData.start_bid),
          current_bid: parseFloat(formData.start_bid),
          year: parseInt(formData.year),
          mileage_km: parseInt(formData.mileage_km),
          description: formData.description, // Salvando a descrição
          status: 'active',
          ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select();

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Lote cadastrado com sucesso." });
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao cadastrar", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="mr-2" size={16} /> Voltar
        </Button>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-none shadow-xl rounded-[2rem]">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-2xl font-black">Cadastrar Novo Veículo</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Título do Veículo</Label>
                    <Input 
                      required
                      placeholder="Ex: BMW 320i M Sport"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número do Lote</Label>
                    <Input 
                      required
                      type="number"
                      placeholder="001"
                      value={formData.lot_number}
                      onChange={e => setFormData({...formData, lot_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lance Inicial (R$)</Label>
                    <Input 
                      required
                      type="number"
                      placeholder="0.00"
                      value={formData.start_bid}
                      onChange={e => setFormData({...formData, start_bid: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Input 
                      required
                      type="number"
                      placeholder="2024"
                      value={formData.year}
                      onChange={e => setFormData({...formData, year: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quilometragem (KM)</Label>
                    <Input 
                      required
                      type="number"
                      placeholder="0"
                      value={formData.mileage_km}
                      onChange={e => setFormData({...formData, mileage_km: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição Detalhada</Label>
                  <Textarea 
                    required
                    placeholder="Descreva o estado do veículo, opcionais, revisões, etc."
                    className="min-h-[150px] rounded-2xl"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 h-14 rounded-2xl font-bold text-lg"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> Salvar Lote</>}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLot;