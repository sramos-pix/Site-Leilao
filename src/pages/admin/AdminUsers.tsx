"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Search, Edit, Mail, Phone, Trash2 } from 'lucide-react';
import UserManager from '@/components/admin/UserManager';
import { useToast } from '@/components/ui/use-toast';

const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      if (error) throw error;
      setUsers(data || []);

      const userId = searchParams.get('id');
      if (userId && data) {
        const user = data.find(u => u.id === userId);
        if (user) {
          setSelectedUser(user);
          setIsDialogOpen(true);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchParams]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita e removerá o perfil do banco de dados.`)) {
      return;
    }

    setIsDeleting(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({ title: "Usuário excluído", description: "O perfil foi removido com sucesso." });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro ao excluir", 
        description: error.message 
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.document_id?.includes(searchTerm))
  );

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Usuários</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Buscar por nome, e-mail ou CPF..." 
            className="pl-10 rounded-xl border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6">Usuário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status KYC</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{u.full_name || 'Sem nome'}</span>
                        <span className="text-xs text-slate-400">{u.document_id || 'CPF não informado'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Mail size={12} /> {u.email}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Phone size={12} /> {u.phone || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        u.kyc_status === 'verified' ? "bg-green-100 text-green-600 border-none" :
                        u.kyc_status === 'pending' ? "bg-yellow-100 text-yellow-600 border-none" :
                        "bg-slate-100 text-slate-400 border-none"
                      }>
                        {u.kyc_status === 'verified' ? 'Verificado' : u.kyc_status === 'pending' ? 'Pendente' : 'Aguardando'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-orange-500 hover:bg-orange-50 rounded-full"
                          onClick={() => handleEdit(u)}
                        >
                          <Edit size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full"
                          onClick={() => handleDeleteUser(u.id, u.full_name)}
                          disabled={isDeleting === u.id}
                        >
                          {isDeleting === u.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 size={18} />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedUser(null);
          setSearchParams({});
        }
      }}>
        <DialogContent className="max-w-3xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>Editar Perfil do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserManager 
              user={selectedUser} 
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchUsers();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;