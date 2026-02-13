"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const auctionSchema = z.object({
  title: z.string().min(5, 'Título muito curto'),
  description: z.string().min(10, 'Descrição muito curta'),
  location: z.string().min(5, 'Localização obrigatória'),
  startsAt: z.string().min(1, 'Data de início obrigatória'),
  endsAt: z.string().min(1, 'Data de término obrigatória'),
  buyerFeePercent: z.coerce.number().min(0).max(100),
});

type AuctionFormValues = z.infer<typeof auctionSchema>;

interface AuctionFormProps {
  onSuccess: () => void;
}

const AuctionForm = ({ onSuccess }: AuctionFormProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AuctionFormValues>({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      buyerFeePercent: 5,
    }
  });

  const onSubmit = async (data: AuctionFormValues) => {
    setIsLoading(false);
    setIsLoading(true);
    try {
      // Chamada para o nosso novo backend profissional
      const response = await fetch('http://localhost:3001/api/admin/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Em produção, aqui iria o token JWT do admin
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || 'mock-token'}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar leilão');
      }

      toast({ title: "Sucesso!", description: "Evento de leilão criado no backend profissional." });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro na API", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Título do Leilão</Label>
        <Input {...register('title')} placeholder="Ex: Leilão de Frota Executiva - SP" className="rounded-xl" />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea {...register('description')} placeholder="Detalhes sobre o leilão..." className="rounded-xl min-h-[100px]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Localização</Label>
          <Input {...register('location')} placeholder="Ex: São Paulo, SP" className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Taxa do Comprador (%)</Label>
          <Input type="number" {...register('buyerFeePercent')} className="rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data de Início</Label>
          <Input type="datetime-local" {...register('startsAt')} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Data de Término</Label>
          <Input type="datetime-local" {...register('endsAt')} className="rounded-xl" />
        </div>
      </div>

      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-xl font-bold" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : 'CRIAR LEILÃO ATIVO'}
      </Button>
    </form>
  );
};

export default AuctionForm;