"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  Users, Gavel, Package, Settings, 
  Search, Filter, MoreVertical, Edit, 
  Trash2, CheckCircle2, XCircle, Clock,
  ShieldCheck, AlertCircle, Loader2, FileText, Download, LogOut
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

const Admin = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('users');
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
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Usuário excluído", description: "O perfil foi removido com sucesso." });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.document_id?.includes(searchTerm)
  );

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-600 border-none"><CheckCircle2 size={12} className="mr-1" /> Verificado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-600 border-none"><XCircle size={12} className="mr-1" /> Rejeitado</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-600 border-none"><Clock size={12} className="mr-1" /> Pendente</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-400">Não Enviado</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Gavel size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">ADMIN</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('users')}
            className={`w-full justify-start rounded-xl ${activeTab === 'users' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Users size={20} className="mr-3" /> Usuários
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('lots')}
            className={`w-full justify-start rounded-xl ${activeTab === 'lots' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Package size={20} className="mr-3" /> Lotes
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('settings')}
            className={`w-full justify-start rounded-xl ${activeTab === 'settings' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Settings size={20} className="mr-3" /> Configurações
          </Button>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {activeTab === 'users' ? 'Gerenciamento de Usuários' : activeTab === 'lots' ? 'Gerenciamento de Lotes' : 'Configurações'}
          </h1>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Buscar..." 
                className="pl-10 w-64 bg-white border-none shadow-sm rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl" onClick={fetchData}>
              Atualizar
            </Button>
          </div>
        </div>

        {activeTab === 'users' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Aguardando KYC</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-500">
                    {users.filter(u => u.kyc_status === 'pending').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Verificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-500">
                    {users.filter(u => u.kyc_status === 'verified').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="font-bold">Usuário</TableHead>
                    <TableHead className="font-bold">Documento</TableHead>
                    <TableHead className="font-bold">Status KYC</TableHead>
                    <TableHead className="font-bold">Arquivo</TableHead>
                    <TableHead className="text-right font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="flex flex-col text-left hover:opacity-70 transition-opacity">
                                <span className="font-bold text-slate-900">{user.full_name || 'Sem Nome'}</span>
                                <span className="text-xs text-slate-500">{user.email}</span>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Gerenciar Usuário: {user.full_name}</DialogTitle>
                              </DialogHeader>
                              <UserManager user={user} onSuccess={() => fetchData()} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium">
                          {user.document_id || '---'}
                        </TableCell>
                        <TableCell>
                          {getKycBadge(user.kyc_status)}
                        </TableCell>
                        <TableCell>
                          {user.document_url ? (
                            <a 
                              href={user.document_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-orange-600 hover:underline font-medium text-sm"
                            >
                              <Download size={14} /> Ver Doc
                            </a>
                          ) : (
                            <span className="text-slate-300 text-sm">Nenhum</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100">
                                  <Edit size={18} className="text-slate-400" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Gerenciar Usuário: {user.full_name}</DialogTitle>
                                </DialogHeader>
                                <UserManager user={user} onSuccess={() => fetchData()} />
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-slate-400 italic">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </>
        )}

        {activeTab !== 'users' && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <AlertCircle className="text-slate-300 mb-4" size={48} />
            <p className="text-slate-500">Esta seção está sendo carregada ou não possui itens.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;