"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  MessageCircle, 
  Filter,
  Calendar,
  UserCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import WhatsAppManager from "@/components/admin/WhatsAppManager";
import UserDetailsDialog from "@/components/admin/UserDetailsDialog";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchUsers();
  }, [sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: sortOrder === "asc" });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (u.full_name?.toLowerCase() || "").includes(searchLower) ||
      (u.email?.toLowerCase() || "").includes(searchLower) ||
      (u.document_id || "").includes(searchTerm);
    
    // Normalização do filtro de status para bater com o banco
    let matchesStatus = statusFilter === "all";
    if (!matchesStatus) {
      const s = u.kyc_status?.toLowerCase();
      if (statusFilter === "verified") matchesStatus = s === "verified" || s === "approved";
      else if (statusFilter === "pending") matchesStatus = s === "pending" || !s;
      else if (statusFilter === "rejected") matchesStatus = s === "rejected";
    }

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all" && u.created_at) {
      const userDate = new Date(u.created_at);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate = userDate.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = userDate >= lastWeek;
      } else if (dateFilter === "month") {
        matchesDate = userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
      }
    }

    return matchesSearch && matchesStatus && matchesRole && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    
    // Mapeamento flexível para aceitar 'verified' ou 'approved'
    if (s === "verified" || s === "approved") {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none"><ShieldCheck size={12} className="mr-1" /> Aprovado</Badge>;
    }
    if (s === "rejected") {
      return <Badge variant="destructive" className="border-none"><ShieldAlert size={12} className="mr-1" /> Rejeitado</Badge>;
    }
    if (s === "pending" || !s) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none"><ShieldQuestion size={12} className="mr-1" /> Pendente</Badge>;
    }
    return <Badge variant="outline" className="text-slate-400 border-slate-200">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Usuários</h1>
          <p className="text-slate-500 text-sm">Visualize e gerencie todos os clientes da plataforma.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 h-9 border-slate-200 text-slate-600 font-bold">
            {filteredUsers.length} Usuários Encontrados
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Nome, email ou CPF..."
            className="pl-10 rounded-xl border-slate-200 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="rounded-xl border-slate-200">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <SelectValue placeholder="Status KYC" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="verified">Aprovados</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="rounded-xl border-slate-200">
            <div className="flex items-center gap-2">
              <UserCircle size={16} className="text-slate-400" />
              <SelectValue placeholder="Papel" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Papéis</SelectItem>
            <SelectItem value="user">Clientes</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="rounded-xl border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <SelectValue placeholder="Data de Cadastro" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer Data</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="pl-6">Usuário</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={toggleSort}>
                <div className="flex items-center gap-1">
                  Cadastro
                  {sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </div>
              </TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status KYC</TableHead>
              <TableHead className="text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Nenhum usuário encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{u.full_name || 'Sem nome'}</span>
                      <span className="text-xs text-slate-400">{u.document_id || 'CPF não informado'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-xs text-slate-500"><Mail size={12} /> {u.email}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Phone size={12} /> {u.phone || '-'}</div>
                        
                        {u.phone && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                <MessageCircle size={14} />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <MessageCircle className="text-green-500" /> WhatsApp Business
                                </DialogTitle>
                              </DialogHeader>
                              <WhatsAppManager user={u} />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-700 font-medium">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'outline'} className={u.role === 'admin' ? 'bg-purple-600' : ''}>
                      {u.role === 'admin' ? 'Admin' : 'Cliente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(u.kyc_status)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <UserDetailsDialog user={u} onUpdate={fetchUsers} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;