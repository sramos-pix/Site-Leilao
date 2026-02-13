import React from 'react';
import { 
  Plus, Gavel, Users, RefreshCw, 
  Package, BarChart3, Settings, LogOut,
  TrendingUp, AlertTriangle, FileText, History,
  Download, Edit3, UserCog
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

const Admin = () => {
  const [auctions, setAuctions] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuctionDialogOpen, setIsAuctionDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Buscando perfis com uma query limpa para garantir que novos usuários apareçam
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: auctionsData } = await supabase
        .from('auctions')
        .select('*, lots(count)')
        .order('created_at', { ascending: false });

      const { data: logsData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (profilesError) throw profilesError;
      
      if (auctionsData) setAuctions(auctionsData);
      if (profilesData) setUsers(profilesData);
      if (logsData) setAuditLogs(logsData);
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao carregar dados", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = (auction: any) => {
    toast({
      title: "Gerando Relatório",
      description: `O relatório do leilão "${auction.title}" está sendo processado.`,
    });
    
    setTimeout(() => {
      const content = `Relatório de Leilão: ${auction.title}\nStatus: ${auction.status}\nData: ${new Date().toLocaleDateString()}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${auction.id}.txt`;
      a.click();
    }, 1500);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1 rounded-lg"><Gavel size={20} /></div>
            <span className="font-bold text-lg">AUTO BID ADMIN</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-white bg-slate-800"><BarChart3 size={18} /> Dashboard</Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800"><Package size={18} /> Leilões</Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800"><Users size={18} /> Usuários</Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800"><History size={18} /> Auditoria</Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800"><Settings size={18} /> Configurações</Button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Link to="/"><Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-red-400"><LogOut size={18} /> Sair</Button></Link>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Painel de Controle</h1>
              <p className="text-slate-500">Gerencie leilões, usuários e operações.</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isAuctionDialogOpen} onOpenChange={setIsAuctionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"><Plus size={20} className="mr-2" /> Novo Leilão</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Criar Novo Leilão</DialogTitle></DialogHeader>
                  <AuctionForm onSuccess={() => { setIsAuctionDialogOpen(false); fetchData(); }} />
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={fetchData} className="bg-white rounded-xl shadow-sm">
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
              </Button>
            </div>
          </header>

          <Tabs defaultValue="auctions" className="w-full">
            <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 mb-8">
              <TabsTrigger value="auctions" className="rounded-xl px-8 py-3">Leilões</TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl px-8 py-3">Usuários</TabsTrigger>
              <TabsTrigger value="audit" className="rounded-xl px-8 py-3">Auditoria</TabsTrigger>
            </TabsList>

            <TabsContent value="auctions">
              <div className="grid grid-cols-1 gap-4">
                {auctions.map(auction => (
                  <Card key={auction.id} className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between p-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{auction.title}</CardTitle>
                          <Badge className={auction.status === 'live' ? 'bg-red-500' : 'bg-blue-500'}>{auction.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{auction.location} • {auction.lots?.[0]?.count || 0} lotes</p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-xl">
                              <Edit3 size={16} className="mr-2" /> Gerenciar Lotes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Gerenciar Lotes: {auction.title}</DialogTitle>
                            </DialogHeader>
                            <LotManager auctionId={auction.id} />
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleExportReport(auction)}>
                          <Download size={16} className="mr-2" /> Relatório
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-bold">Usuário</th>
                        <th className="px-6 py-4 font-bold">Documento</th>
                        <th className="px-6 py-4 font-bold">Status KYC</th>
                        <th className="px-6 py-4 font-bold">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
                      ) : (
                        users.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{user.full_name || 'Sem Nome'}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-600">{user.document_id || '---'}</td>
                            <td className="px-6 py-4">
                              <Badge className={
                                user.kyc_status === 'verified' ? 'bg-green-100 text-green-700 border-none' : 
                                user.kyc_status === 'rejected' ? 'bg-red-100 text-red-700 border-none' :
                                'bg-orange-100 text-orange-700 border-none'
                              }>
                                {user.kyc_status === 'verified' ? 'Verificado' : user.kyc_status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-50 rounded-lg">
                                    <UserCog size={16} className="mr-2" /> Editar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Gerenciar Usuário</DialogTitle>
                                  </DialogHeader>
                                  <UserManager user={user} onSuccess={() => fetchData()} />
                                </DialogContent>
                              </Dialog>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card className="border-none shadow-sm bg-white p-6 rounded-2xl">
                <div className="space-y-6">
                  {auditLogs.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">Nenhum log de auditoria registrado.</p>
                  ) : (
                    auditLogs.map(log => (
                      <div key={log.id} className="flex gap-4 items-start border-l-2 border-orange-200 pl-4 pb-6">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-600"><FileText size={16} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{log.action}</p>
                          <p className="text-xs text-slate-500">Entidade: {log.entity_type} • ID: {log.entity_id}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
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