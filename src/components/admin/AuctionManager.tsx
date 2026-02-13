"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Gavel, Calendar, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AuctionForm from './AuctionForm';
import LotForm from './LotForm';
import LotManager from './LotManager';
import { useToast } from '@/components/ui/use-toast';

const AuctionManager = () => {
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/auctions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || 'mock-token'}`
        }
      });
      
      if (!response.ok) throw new Error('Falha ao buscar leilões');
      
      const data = await response.json();
      setAuctions(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao servidor backend." });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAuctions();
  }, []);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-orange-500" size={40} />
      <p className="text-slate-500 font-medium">Conectando ao servidor profissional...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Eventos de Leilão</h2>
          <p className="text-sm text-slate-500">Gerencie os eventos ativos e agendados na plataforma.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchAuctions} className="rounded-xl">
            <RefreshCw size={18} />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6">
                <Plus size={18} className="mr-2" /> Novo Leilão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Criar Novo Evento</DialogTitle>
              </DialogHeader>
              <AuctionForm onSuccess={fetchAuctions} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {auctions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <Gavel className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500">Nenhum leilão encontrado no banco de dados.</p>
          </div>
        ) : (
          auctions.map((auction) => (
            <Card key={auction.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <Gavel size={20} />
                      </div>
                      <h3 className="font-bold text-xl text-slate-900">{auction.title}</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">
                        {auction._count?.lots || 0} Veículos
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm text-slate-500 ml-12">
                      <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {auction.location}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400" /> {new Date(auction.startsAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 md:flex-none rounded-xl border-slate-200 hover:bg-slate-50">
                          Gerenciar Lotes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Veículos: {auction.title}</DialogTitle>
                        </DialogHeader>
                        <LotManager auctionId={auction.id} />
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                          <Plus size={18} className="mr-1" /> Add Veículo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Cadastrar Veículo</DialogTitle>
                        </DialogHeader>
                        <LotForm auctionId={auction.id} onSuccess={fetchAuctions} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AuctionManager;