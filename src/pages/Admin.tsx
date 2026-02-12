import React from 'react';
import { Plus, Gavel, Car, Settings, Trash2, Edit, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';

const Admin = () => {
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchAuctions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('auctions')
      .select('*, lots(count)')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ variant: "destructive", title: "Erro ao carregar leilões", description: error.message });
    } else {
      setAuctions(data || []);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo</h1>
            <p className="text-slate-500">Gerencie seus leilões, lotes e usuários.</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
              <Plus size={20} className="mr-2" />
              Novo Leilão
            </Button>
          </div>
        </div>

        <Tabs defaultValue="auctions" className="w-full">
          <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <TabsTrigger value="auctions" className="rounded-xl px-8 py-3">Leilões</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-8 py-3">Usuários</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-8 py-3">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="auctions">
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <p>Carregando...</p>
              ) : auctions.length === 0 ? (
                <Card className="border-dashed border-2 bg-transparent">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Gavel size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-500">Nenhum leilão cadastrado ainda.</p>
                  </CardContent>
                </Card>
              ) : (
                auctions.map((auction) => (
                  <Card key={auction.id} className="border-none shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-center">
                        <div className="p-6 flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`w-3 h-3 rounded-full ${auction.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                            <h3 className="text-xl font-bold text-slate-900">{auction.title}</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-500">
                            <div>
                              <p className="font-bold text-slate-400 uppercase text-[10px]">Status</p>
                              <p className="capitalize">{auction.status}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-400 uppercase text-[10px]">Lotes</p>
                              <p>{auction.lots?.[0]?.count || 0} veículos</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-400 uppercase text-[10px]">Início</p>
                              <p>{formatDate(auction.starts_at)}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-400 uppercase text-[10px]">Local</p>
                              <p>{auction.location}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-6 flex gap-2 border-l border-slate-100">
                          <Button variant="outline" size="icon" className="rounded-lg">
                            <Edit size={18} />
                          </Button>
                          <Button variant="outline" size="icon" className="rounded-lg text-red-500 hover:text-red-600">
                            <Trash2 size={18} />
                          </Button>
                          <Button className="bg-slate-900 text-white rounded-lg">
                            Gerenciar Lotes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Usuários Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500">A funcionalidade de gestão de usuários será integrada com o Supabase Auth.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;