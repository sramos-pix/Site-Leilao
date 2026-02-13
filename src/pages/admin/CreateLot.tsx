"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

const CreateLot = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Lote cadastrado com sucesso!');
    navigate('/admin/lots');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-black text-slate-900">Novo Lote</h1>
        </div>
        <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8">
          <Save size={18} className="mr-2" /> Salvar Lote
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-none shadow-sm bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Veículo</Label>
                <Input id="title" placeholder="Ex: BMW 320i M Sport 2022" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input id="category" placeholder="Ex: Sedans Luxo" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada</Label>
              <Textarea id="description" placeholder="Detalhes sobre o estado, opcionais, etc." className="min-h-[120px]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-orange-50 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-orange-700">
              <Star size={20} /> Visibilidade e Destaque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-slate-900">Lote em Destaque</Label>
                <p className="text-sm text-slate-500">Exibir este lote na seção principal de "Lotes em Destaque" da Home.</p>
              </div>
              <Switch id="featured" />
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-slate-900">Destaque da Semana</Label>
                <p className="text-sm text-slate-500">Colocar este lote no banner principal de "Destaques da Semana".</p>
              </div>
              <Switch id="weekly_highlight" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Valores e Prazos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial_bid">Lance Inicial (R$)</Label>
              <Input id="initial_bid" type="number" placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="increment">Incremento Mínimo (R$)</Label>
              <Input id="increment" type="number" placeholder="500,00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Encerramento</Label>
              <Input id="end_date" type="datetime-local" />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateLot;