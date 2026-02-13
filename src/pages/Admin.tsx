"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Users, Gavel, Package, Settings, 
  Search, LayoutDashboard, LogOut, Loader2, Download, Edit, Trash2, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import UserManager from '@/components/admin/UserManager';
import AdminOverview from '@/components/admin/AdminOverview';
import AuctionManager from '@/components/admin/AuctionManager';
import LotManager from '@/components/admin/LotManager';

const Admin = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_auth');
    toast({ title: "Logout realizado", description: "Sessão administrativa encerrada." });
    navigate('/');
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) toast({ variant: "destructive", title: "Erro", description: error.message });
    else fetchData();
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge className="bg-green-100 text-green-600 border-none">Verificado</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-600 border-none">Rejeitado</Badge>;
      case 'pending': return <Badge className="bg-orange-100 text-orange-600 border-none">Pendente</Badge>;
      default: return <Badge variant="outline">Não Enviado</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Gavel size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">ADMIN</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'auctions', icon: Gavel, label: 'Leilões' },
            { id: 'lots', icon: Package, label: 'Lotes/Veículos' },
            { id: 'users', icon: Users, label: 'Usuários' },
            { id: 'settings', icon: Settings, label: 'Configurações' },
          ].map((item) => (
            <Button 
              key={item.id}
              variant="ghost" 
              onClick={() => setActiveTab(item.id)}
              className={`w-full justify-start rounded-xl ${activeTab === item.id ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <item.icon size={20} className="mr-3" /> {item.label}
            </Button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <Button 
            variant="ghost" 
            onClick={handleAdminLogout}
            className="w-full justify-start rounded-xl text-red-400 hover:text-white hover:bg-red-600/20"
          >
            <LogOut size={20} className="mr-3" /> Sair do Painel
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <AdminOverview />}
        
        {activeTab === 'auctions' && <AuctionManager />}
        
        {activeTab === 'lots' && <LotManager />}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Gerenciar Usuários</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Buscar usuário..." 
                  className="pl-10 w-64 bg-white border-none shadow-sm rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status KYC</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                  ) : filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{user.full_name}</span>
                          <span className="text-xs text-slate-500">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getKycBadge(user.kyc_status)}</TableCell>
                      <TableCell>
                        {user.document_url && (
                          <a href={user.document_url} target="_blank" className="text-orange-600 text-sm flex items-center gap-1 hover:underline">
                            <Download size={14} /> Ver Doc
                          </a>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon"><Edit size={18} /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <UserManager user={user} onSuccess={fetchData} />
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} className="text-red-500"><Trash2 size={18} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <Settings className="text-slate-200 mb-4" size={48} />
            <p className="text-slate-500">Configurações do sistema em desenvolvimento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;