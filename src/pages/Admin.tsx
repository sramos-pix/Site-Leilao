import React from 'react';
import { Plus, Gavel, Users, Settings, Trash2, Edit, Search, UserPlus, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import LotForm from '@/components/admin/LotForm';
import AuctionForm from '@/components/admin/AuctionForm';

const Admin = () => {
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    const { data: auctionsData } = await supabase
      .from('auctions')
      .select('*, lots(count)')
      .order('created_at', { ascending: false });
    setAuctions(auctionsData || []);
    
    const { data: profilesData } = await supabase.from('profiles').select('*');
    setUsers(profilesData || []);
    
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo</h1>
            <p className="text-slate-500">Gerencie leilões, veículos e usuários da plataforma.</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isAuctionDialogOpen} onOpenChange={setIsAuctionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6">
                  <Plus size={20} className="mr-2" />
                  Novo Leilão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Leilão</DialogTitle>
                </DialogHeader>
                <AuctionForm onSuccess={() => {
                  setIsAuctionDialogOpen(false);
                  fetchData();
                }} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={fetchData} className="rounded-xl">
              Atualizar Dados
            </Button>
          </div>
        </div>

        <Tabs defaultValue="auctions" className="w-full">
          <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <TabsTrigger value="auctions" className="rounded-xl px-8 py-3">Leilões e Veículos</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-8 py-3">Usuários</TabsTrigger>
          </TabsList>

          <TabsContent value="auctions">
            <div className="grid grid-cols-1 gap-6">
              {auctions.length === 0 && !isLoading ? (
                <Card className="border-dashed border-2 bg-transparent py-12 text-center">
                  <Gavel className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500">Nenhum leilão cadastrado. Comece criando um novo leilão.</p>
                </Card>
              ) : (
                auctions.map((auction) => (
                  <Card key={auction.id} className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-white border-b">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{auction.title}</CardTitle>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            auction.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {auction.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{auction.location} • {auction.lots?.[0]?.count || 0} veículos</p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                              <Plus size={16} className="mr-2" /> Add Veículo
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Cadastrar Veículo em: {auction.title}</DialogTitle>
                            </DialogHeader>
                            <LotForm auctionId={auction.id} onSuccess={fetchData} />
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestão de Usuários</CardTitle>
                <Button className="bg-slate-900">
                  <UserPlus size={16} className="mr-2" /> Novo Usuário
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input className="pl-10" placeholder="Buscar por nome ou e-mail..." />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-slate-400 uppercase text-[10px] font-bold">
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">E-mail</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-8 text-slate-400">Nenhum usuário encontrado.</td></tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id} className="border-b hover:bg-slate-50">
                            <td className="px-4 py-4 font-medium">{user.full_name}</td>
                            <td className="px-4 py-4">{user.email}</td>
                            <td className="px-4 py-4">
                              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-[10px] font-bold">ATIVO</span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Button variant="ghost" size="sm"><Edit size={14} /></Button>
                              <Button variant="ghost" size="sm" className="text-red-500"><Trash2 size={14} /></Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;