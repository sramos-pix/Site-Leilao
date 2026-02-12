import React from 'react';
import { Plus, Gavel, Users, Settings, Trash2, Edit, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import LotForm from '@/components/admin/LotForm';

const Admin = () => {
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    const { data: auctionsData } = await supabase.from('auctions').select('*, lots(count)');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo</h1>
          <div className="flex gap-2">
             <Button variant="outline" onClick={fetchData}>Atualizar Dados</Button>
          </div>
        </div>

        <Tabs defaultValue="auctions" className="w-full">
          <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <TabsTrigger value="auctions" className="rounded-xl px-8 py-3">Leilões e Veículos</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-8 py-3">Usuários</TabsTrigger>
          </TabsList>

          <TabsContent value="auctions">
            <div className="grid grid-cols-1 gap-6">
              {auctions.map((auction) => (
                <Card key={auction.id} className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{auction.title}</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-orange-500">
                          <Plus size={16} className="mr-2" /> Add Veículo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Cadastrar Novo Veículo no Leilão</DialogTitle>
                        </DialogHeader>
                        <LotForm auctionId={auction.id} onSuccess={fetchData} />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500 mb-4">{auction.location} • {auction.lots?.[0]?.count || 0} lotes cadastrados</p>
                  </CardContent>
                </Card>
              ))}
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