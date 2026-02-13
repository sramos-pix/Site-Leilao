"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

const LotForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    lot_number: '',
    start_bid: '',
    bid_increment: '500', // Valor padrão
    cover_image_url: '',
    is_weekly_highlight: false
  });

  useEffect(() => {
    if (id) {
      fetchLot();
    }
  }, [id]);

  const fetchLot = async () => {
    const { data, error } = await supabase
      .from('lots')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setFormData(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = id 
      ? await supabase.from('lots').update(formData).eq('id', id)
      : await supabase.from('lots').insert([formData]);

    if (error) {
      toast.error("Erro ao salvar veículo");
    } else {
      toast.success("Veículo salvo com sucesso!");
      navigate('/admin/lots');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-sm border mt-10">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Editar Veículo' : 'Novo Veículo'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Veículo</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Toyota Corolla 2023"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lot_number">Número do Lote</Label>
            <Input 
              id="lot_number" 
              value={formData.lot_number} 
              onChange={(e) => setFormData({...formData, lot_number: e.target.value})}
              placeholder="Ex: 001"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_bid">Lance Inicial (R$)</Label>
            <Input 
              id="start_bid" 
              type="number"
              value={formData.start_bid} 
              onChange={(e) => setFormData({...formData, start_bid: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>
          
          {/* NOVO CAMPO DE INCREMENTO */}
          <div className="space-y-2">
            <Label htmlFor="bid_increment" className="text-orange-600 font-bold">Incremento Mínimo (R$)</Label>
            <Input 
              id="bid_increment" 
              type="number"
              className="border-orange-200 focus:border-orange-500"
              value={formData.bid_increment} 
              onChange={(e) => setFormData({...formData, bid_increment: e.target.value})}
              placeholder="Ex: 500"
              required
            />
            <p className="text-[10px] text-slate-400 italic">Valor somado a cada novo lance.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="highlight"
            checked={formData.is_weekly_highlight}
            onChange={(e) => setFormData({...formData, is_weekly_highlight: e.target.checked})}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <Label htmlFor="highlight">Destaque da Semana</Label>
        </div>

        <Button type="submit" className="w-full bg-slate-900 hover:bg-orange-600 h-12 rounded-xl" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Veículo"}
        </Button>
      </form>
    </div>
  );
};

export default LotForm;