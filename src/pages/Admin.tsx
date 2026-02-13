import React from 'react';
import { 
  Plus, Gavel, Users, RefreshCw, 
  Package, BarChart3, Settings, LogOut,
  ShieldCheck, ShieldAlert, ShieldQuestion
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import LotForm from '@/components/admin/LotForm';
import AuctionForm from '@/components/admin/AuctionForm';
import { Link } from 'react-router-dom';

const Admin = () => {
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: auctionsData, error: auctionError } = await supabase
        .from('auctions')
        .select('*, lots(count)')
        .order('created_at', { ascending: false });
      
      if (auctionError) throw auctionError;
      setAuctions(auctionsData || []);
      
      const { data: profilesData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!profileError) setUsers(profilesData || []);
      
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro de conexão", 
        description: "Não foi possível carregar os dados do banco." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700 border-none flex items-center gap-1"><ShieldCheck size={12} /> Verificado</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-700 border-none flex items-center gap-1"><ShieldQuestion size={12} /> Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-none flex items-center gap-1"><ShieldAlert size={12} /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-400">Não Iniciado</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1 rounded-lg">
              <Gavel size={20} />
            </div>
            <span className="font-bold text-lg">Painel Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800">
            <BarChart3 size={18} /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-white bg-slate-800">
            <Package size={18} /> Leilões
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800">
            <Users size={18} /> Usuários
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800">
            <Settings size={18} /> Configurações
          </Button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-red-400">
              <LogOut size={18} /> Sair do Admin
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gerenciamento da Plataforma</h1>
              <p className="text-slate-500">Controle de leilões, veículos e usuários cadastrados.</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isAuctionDialogOpen} onOpenChange={setIsAuctionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6">
                    <Plus size={20} className="mr-2" /> Novo Leilão
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
              <Button variant="outline" onClick={fetchData} className="rounded-xl bg-white" disabled={isLoading}>
                <RefreshCw size={18} className={isLoading ? "animate-spin mr-2" : "mr-2"} />
                Atualizar
              </Button>
            </div>
          </div>

          <Tabs defaultValue="auctions" className="w-full">
            <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-8">
              <TabsTrigger value="auctions" className="rounded-xl px-8 py-3">Leilões Ativos</TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl px-8 py-3">Usuários ({users.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="auctions">
              <div className="grid grid-cols-1 gap-6">
                {auctions.length === 0 && !isLoading ? (
                  <Card className="border-dashed border-2 bg-transparent py-12 text-center">
                    <Gavel className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500">Nenhum leilão encontrado no banco de dados.</p>
                  </Card>
                ) : (
                  auctions.map((auction) => (
                    <Card key={auction.id} className="border-none shadow-sm overflow-hidden bg-white">
                      <CardHeader className="flex flex-row items-center justify-between border-b p-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{auction.title}</CardTitle>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              auction.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {auction.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {auction.location} • {auction.lots?.[0]?.count || 0} veículos cadastrados
                          </p>
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
                                <DialogTitle>Cadastrar Veículo no Leilão</DialogTitle>
                              </DialogHeader>
                              <LotForm auctionId={auction.id} onSuccess={fetchData} />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                  <CardTitle className="text-lg">Base de Usuários Completa</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold border-b">
                          <th className="px-6 py-4">Nome / Documento</th>
                          <th className="px-6 py-4">Contato</th>
                          <th className="px-6 py-4">Localização</th>
                          <th className="px-6 py-4">Status KYC</th>
                          <th className="px-6 py-4">Cadastro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{user.full_name || 'Sem nome'}</span>
                                <span className="text-xs text-slate-500 font-mono">{user.document_id || 'CPF não informado'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-slate-700">{user.email}</span>
                                <span className="text-xs text-slate-500">{user.phone || 'Sem telefone'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-slate-700">{user.city || 'N/A'}</span>
                                <span className="text-xs text-slate-500">{user.state || '--'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getKycBadge(user.kyc_status)}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;