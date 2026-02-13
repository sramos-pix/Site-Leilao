import React from 'react';
import { 
  Plus, Gavel, Users, RefreshCw, 
  Package, BarChart3, Settings, LogOut,
  ShieldCheck, ShieldAlert, ShieldQuestion,
  TrendingUp, AlertTriangle, FileText, History
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
      const [auctionsRes, profilesRes, logsRes] = await Promise.all([
        supabase.from('auctions').select('*, lots(count)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10)
      ]);
      
      if (auctionsRes.data) setAuctions(auctionsRes.data);
      if (profilesRes.data) setUsers(profilesRes.data);
      if (logsRes.data) setAuditLogs(logsRes.data);
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro de conexão", description: error.message });
    } finally {
      setIsLoading(false);
    }
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
              <h1 className="text-3xl font-bold text-slate-900">Visão Geral</h1>
              <p className="text-slate-500">Métricas e controle operacional em tempo real.</p>
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
              <Button variant="outline" onClick={fetchData} className="bg-white rounded-xl"><RefreshCw size={18} className={isLoading ? "animate-spin" : ""} /></Button>
            </div>
          </header>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600"><TrendingUp size={20} /></div>
                  <Badge className="bg-green-100 text-green-700 border-none">+12%</Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500">GMV (Volume Total)</p>
                  <p className="text-2xl font-bold">{formatCurrency(1250000)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Gavel size={20} /></div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500">Leilões Ativos</p>
                  <p className="text-2xl font-bold">{auctions.filter(a => a.status === 'live').length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-red-50 border-red-100">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertTriangle size={20} /></div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-red-600 font-medium">Pagamentos Atrasados</p>
                  <p className="text-2xl font-bold text-red-700">04</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users size={20} /></div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-500">Cadastros Pendentes</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.kyc_status === 'pending').length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

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
                        <Button variant="outline" size="sm">Gerenciar Lotes</Button>
                        <Button variant="outline" size="sm">Relatório</Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border-none shadow-sm bg-white overflow-hidden">
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
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{user.document_id}</td>
                          <td className="px-6 py-4">
                            <Badge className={user.kyc_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                              {user.kyc_status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="ghost" size="sm" className="text-orange-600">Ver Detalhes</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card className="border-none shadow-sm bg-white p-6">
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