import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search } from 'lucide-react';
import { fetchFipeValue } from '@/lib/fipe';

const lotSchema = z.object({
  title: z.string().min(5, 'Título muito curto'),
  brand: z.string().min(2, 'Marca obrigatória'),
  model: z.string().min(2, 'Modelo obrigatório'),
  year: z.coerce.number().min(1900),
  mileage_km: z.coerce.number().min(0),
  start_bid: z.coerce.number().min(1),
  min_increment: z.coerce.number().min(1),
  fipe_value: z.coerce.number().min(0).optional(),
  condition_notes: z.string().optional(),
  auction_id: z.string(),
});

type LotFormValues = z.infer<typeof lotSchema>;

interface LotFormProps {
  auctionId: string;
  onSuccess: () => void;
}

const LotForm = ({ auctionId, onSuccess }: LotFormProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetchingFipe, setIsFetchingFipe] = React.useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<LotFormValues>({
    resolver: zodResolver(lotSchema),
    defaultValues: {
      auction_id: auctionId,
      year: 2024,
      mileage_km: 0,
      min_increment: 500
    }
  });

  const brand = watch('brand');
  const model = watch('model');
  const year = watch('year');

  const handleFetchFipe = async () => {
    if (!brand || !model || !year) {
      toast({ variant: 'destructive', title: 'Preencha Marca, Modelo e Ano antes de buscar o FIPE.' });
      return;
    }
    setIsFetchingFipe(true);
    try {
      const value = await fetchFipeValue(brand, model, Number(year));
      if (value) {
        setValue('fipe_value', value);
        toast({ title: `FIPE encontrado: R$ ${value.toLocaleString('pt-BR')}` });
      } else {
        toast({ variant: 'destructive', title: 'Não encontrado na tabela FIPE', description: 'Verifique a marca e modelo ou insira manualmente.' });
      }
    } finally {
      setIsFetchingFipe(false);
    }
  };

  const onSubmit = async (data: LotFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('lots').insert({
        ...data,
        lot_number: Math.floor(Math.random() * 10000),
        ends_at: new Date(Date.now() + 86400000 * 7).toISOString(),
      });

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Veículo cadastrado." });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label>Título</Label>
          <Input {...register('title')} />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Marca</Label>
          <Input {...register('brand')} placeholder="Ex: VOLKSWAGEN" />
        </div>
        <div className="space-y-2">
          <Label>Modelo</Label>
          <Input {...register('model')} placeholder="Ex: NIVUS" />
        </div>
        <div className="space-y-2">
          <Label>Ano</Label>
          <Input type="number" {...register('year')} />
        </div>
        <div className="space-y-2">
          <Label>KM</Label>
          <Input type="number" {...register('mileage_km')} />
        </div>
        <div className="space-y-2">
          <Label>Lance Inicial</Label>
          <Input type="number" {...register('start_bid')} />
        </div>
        <div className="space-y-2">
          <Label>Incremento</Label>
          <Input type="number" {...register('min_increment')} />
        </div>
        <div className="space-y-2 col-span-2">
          <div className="flex items-center justify-between">
            <Label>Valor FIPE</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleFetchFipe}
              disabled={isFetchingFipe}
            >
              {isFetchingFipe ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
              {isFetchingFipe ? 'Buscando...' : 'Buscar FIPE'}
            </Button>
          </div>
          <Input type="number" placeholder="Ex: 47000" {...register('fipe_value')} />
          <p className="text-[10px] text-slate-400">Preenchido automaticamente ao clicar em "Buscar FIPE". Exibido como comparativo nos cards e na página do lote.</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notas</Label>
        <Textarea {...register('condition_notes')} />
      </div>
      <Button type="submit" className="w-full bg-orange-500" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : 'Cadastrar'}
      </Button>
    </form>
  );
};

export default LotForm;
