import React from 'react';
import { 
  Plus, Gavel, Users, RefreshCw, 
  Package, BarChart3, Settings, LogOut,
  TrendingUp, AlertTriangle, FileText, History,
  Download, Edit3, UserCog, ArrowUpRight, UserPlus, FileSpreadsheet
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
import LotManager from '@/components/admin/LotManager';
import UserManager from '@/components/admin/UserManager';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const Admin = () => {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [recentBids, setRecentBids] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Busca simplificada para evitar erro de coluna caso o schema esteja desatualizado
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: auctionsData } = await supabase
        .from('auctions')
        .select('*, lots(count)')
        .order('created_at', { ascending: false });

      const { data: bidsData } = await supabase
        .from('bids')
        .select('*, profiles(full_name), lots(title)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (profilesError) throw profilesError;
      
      if (auctionsData) setAuctions(auctionsData);
      if (profilesData) setUsers(profilesData);
      if (bidsData) setRecentBids(bidsData);
      
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao carregar dados", 
        description: "Verifique se a tabela 'profiles' possui a coluna 'document_id'." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportUsersCSV = () => {
    if (users.length === 0) return;
    
    const headers = ["Nome", "Email", "Documento", "Telefone", "Cidade", "UF", "Status KYC", "Data Cadastro"];
    const rows = users.map(u => [
      u.full_name,
      u.email,
      u.document_id || u.cpf || '', // Tenta document_id ou cpf
      u.phone,
      u.city,
      u.state,
      u.kyc_status,
      new Date(u.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(field => `"${field || ''}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `usuarios-autobid-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Relatório Gerado", description: "O arquivo CSV foi baixado com sucesso." });
  };

  const handleExportReport = (auction: any) => {
    toast({ title: "Gerando Relatório", description: `O relatório de "${auction.title}" está sendo processado.` });
    setTimeout(() => {
      const content = `Relatório: ${auction.title}\nStatus: ${auction.status}\nData: ${new Date().toLocaleDateString()}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${auction.id}.txt`;
      a.click();
    }, 1000);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'auctions', label: 'Leilões', icon: Package },
    { id: 'users', label: 'Usuários', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg"><Gavel size={20} /></div>
            <span className="font-bold text-lg tracking-tight">AUTO BID <span className="text-orange-500">PRO</span></span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Button 
              key={item.id}
              variant="ghost" 
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full justify-start gap-3 rounded-xl transition-all",
                activeTab === item.id ? "bg-orange-500 text-white hover:bg-orange-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={18} /> {item.label}
            </Button>
          ))}
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl">
            <Settings size={18} /> Configurações
          </Button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 rounded-xl">
              <LogOut size={18} /> Sair do Painel
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 capitalize">{activeTab}</h1>
              <p className="text-slate-500">Gerenciamento centralizado da plataforma.</p>
            </div>
            <div className="flex gap-3">
              {activeTab === 'users' && (
                <Button variant="outline" onClick={exportUsersCSV} className="bg-white rounded-xl shadow-sm border-none text-slate-600">
                  <FileSpreadsheet size={20} className="mr-2 text-green-600" /> Exportar CSV
                </Button>
              )}
              <Dialog open={isAuctionDialogOpen} onOpenChange={setIsAuctionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200">
                    <Plus size={20} className="mr-2" /> Novo Leilão
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Criar Novo Leilão</DialogTitle></DialogHeader>
                  <AuctionForm onSuccess={() => { setIsAuctionDialogOpen(false); fetchData(); }} />
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={fetchData} className="bg-white rounded-xl shadow-sm border-none">
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
              </Button>
            </div>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="dashboard" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><TrendingUp size={24} /></div>
                      <Badge className="bg-green-100 text-green-700 border-none">+8%</Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Volume de Lances</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(842000)}</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-orange-50 rounded-2xl text-orange-600"><Gavel size={24} /></div>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Leilões em Andamento</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{auctions.filter(a => a.status === 'live').length}</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><Users size={24} /></div>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Total de Usuários</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{users.length}</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm bg-white p-6 rounded-3xl">
                  <CardTitle className="mb-6 flex items-center gap-2">
                    <ArrowUpRight className="text-orange-500" size={20} /> Lances Recentes
                  </CardTitle>
                  <div className="space-y-4">
                    {recentBids.length > 0 ? recentBids.map(bid => (
                      <div key={bid.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-orange-600">
                          <Gavel size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{bid.profiles?.full_name || 'Usuário'}</p>
                          <p className="text-xs text-slate-500">{bid.lots?.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">{formatCurrency(bid.amount)}</p>
                          <p className="text-[10px] text-slate-400">{new Date(bid.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center py-8 text-slate-400 text-sm italic">Nenhum lance recente.</p>
                    )}
                  </div>
                </Card>

                <Card className="border-none shadow-sm bg-white p-6 rounded-3xl">
                  <CardTitle className="mb-6 flex items-center gap-2">
                    <UserPlus className="text-blue-500" size={20} /> Novos Usuários
                  </CardTitle>
                  <div className="space-y-4">
                    {users.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 font-bold">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{user.full_name || 'Sem Nome'}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <Badge className={cn(
                          "border-none text-[10px]",
                          user.kyc_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        )}>
                          {user.kyc_status === 'verified' ? 'Aprovado' : 'Pendente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="auctions">
              <div className="grid grid-cols-1 gap-4">
                {auctions.map(auction => (
                  <Card key={auction.id} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                          <Package size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{auction.title}</h3>
                            <Badge className={auction.status === 'live' ? 'bg-red-500' : 'bg-blue-500'}>{auction.status}</Badge>
                          </div>
                          <p className="text-xs text-slate-500">{auction.location} • {auction.lots?.[0]?.count || 0} lotes cadastrados</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
                              <Edit3 size={16} className="mr-2" /> Lotes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader><DialogTitle>Gerenciar Lotes: {auction.title}</DialogTitle></DialogHeader>
                            <LotManager auctionId={auction.id} />
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => handleExportReport(auction)}>
                          <Download size={16} className="mr-2" /> Relatório
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-slate-600">Usuário</th>
                        <th className="px-6 py-4 font-bold text-slate-600">Documento</th>
                        <th className="px-6 py-4 font-bold text-slate-600">Status KYC</th>
                        <th className="px-6 py-4 font-bold text-slate-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{user.full_name || 'Sem Nome'}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600">{user.document_id || user.cpf || '---'}</td>
                          <td className="px-6 py-4">
                            <Badge className={cn(
                              "border-none px-3 py-1",
                              user.kyc_status === 'verified' ? 'bg-green-100 text-green-700' : 
                              user.kyc_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            )}>
                              {user.kyc_status === 'verified' ? 'Verificado' : user.kyc_status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50 rounded-xl">
                                  <UserCog size={16} className="mr-2" /> Gerenciar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader><DialogTitle>Editar Perfil do Usuário</DialogTitle></DialogHeader>
                                <UserManager user={user} onSuccess={() => fetchData()} />
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;