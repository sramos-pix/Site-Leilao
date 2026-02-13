"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Gavel, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AuctionForm from './AuctionForm';
import LotForm from './LotForm';
import LotManager from './LotManager';

const AuctionManager = () => {
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchAuctions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('auctions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setAuctions(data || []);
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchAuctions();
  }, []);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">Eventos de Leilão</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
              <Plus size={18} className="mr-2" /> Novo Leilão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Evento de Leilão</DialogTitle>
            </DialogHeader>
            <AuctionForm onSuccess={fetchAuctions} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {auctions.map((auction) => (
          <Card key={auction.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Gavel className="text-orange-500" size={20} />
                    <h3 className="font-bold text-lg text-slate-900">{auction.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {auction.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(auction.starts_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-xl border-slate-200">
                        Gerenciar Veículos
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Veículos do Leilão: {auction.title}</DialogTitle>
                      </DialogHeader>
                      <LotManager auctionId={auction.id} />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-slate-900 text-white rounded-xl">
                        <Plus size={16} className="mr-1" /> Add Veículo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cadastrar Veículo no Lote</DialogTitle>
                      </DialogHeader>
                      <LotForm auctionId={auction.id} onSuccess={fetchAuctions} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AuctionManager;