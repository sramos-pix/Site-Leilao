import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const auctionSchema = z.object({
  title: z.string().min(5, 'Título muito curto'),
  description: z.string().min(10, 'Descrição muito curta'),
  location: z.string().min(5, 'Localização obrigatória'),
  starts_at: z.string().min(1, 'Data de início obrigatória'),
  ends_at: z.string().min(1, 'Data de término obrigatória'),
  status: z.enum(['scheduled', 'live', 'finished']),
  buyer_fee_percent: z.coerce.number().min(0).max(100),
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
      status: 'scheduled',
      buyer_fee_percent: 5,
    }
  });

  const onSubmit = async (data: AuctionFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('auctions').insert(data);
      if (error) throw error;

      toast({ title: "Sucesso!", description: "Leilão criado com sucesso." });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao criar leilão", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Título do Leilão</Label>
        <Input {...register('title')} placeholder="Ex: Leilão de Frota Executiva - SP" />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea {...register('description')} placeholder="Detalhes sobre o leilão..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Localização</Label>
          <Input {...register('location')} placeholder="Ex: São Paulo, SP" />
        </div>
        <div className="space-y-2">
          <Label>Taxa do Comprador (%)</Label>
          <Input type="number" {...register('buyer_fee_percent')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data de Início</Label>
          <Input type="datetime-local" {...register('starts_at')} />
        </div>
        <div className="space-y-2">
          <Label>Data de Término</Label>
          <Input type="datetime-local" {...register('ends_at')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status Inicial</Label>
        <Select onValueChange={(value) => setValue('status', value as any)} defaultValue="scheduled">
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Agendado</SelectItem>
            <SelectItem value="live">Ao Vivo</SelectItem>
            <SelectItem value="finished">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : 'Criar Leilão'}
      </Button>
    </form>
  );
};

export default AuctionForm;