"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Bell, Send, Loader2, BookTemplate, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminNotifications = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [usersRes, templatesRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email'),
        supabase.from('notification_templates').select('*').order('title')
      ]);
      
      if (usersRes.data) setUsers(usersRes.data);
      if (templatesRes.data) setTemplates(templatesRes.data);
    };
    fetchData();
  }, []);

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setTitle(template.title);
      setMessage(template.message);
      setType(template.type || 'info');
      toast({ title: "Template aplicado!", description: "Você pode editar a mensagem antes de enviar." });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsLoading(true);
    try {
      let targetUsers = [];
      if (selectedUser === 'all') {
        targetUsers = users.map(u => u.id);
      } else {
        targetUsers = [selectedUser];
      }

      const notifications = targetUsers.map(userId => ({
        user_id: userId,
        title,
        message,
        type
      }));

      const { error } = await supabase.from('notifications').insert(notifications);

      if (error) throw error;

      toast({ title: "Sucesso!", description: `Notificação enviada para ${targetUsers.length} usuário(s).` });
      setTitle('');
      setMessage('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna de Envio */}
      <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="text-orange-500" size={20} /> Enviar Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Destinatário</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Selecione o usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Usuários</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Tipo de Alerta</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informação (Azul)</SelectItem>
                    <SelectItem value="success">Sucesso (Verde)</SelectItem>
                    <SelectItem value="warning">Atenção (Laranja)</SelectItem>
                    <SelectItem value="error">Erro (Vermelho)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Título</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Novo Leilão Disponível!"
                className="rounded-xl h-12 font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Mensagem</label>
              <Textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite o conteúdo da notificação..."
                className="rounded-xl min-h-[150px] resize-none"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !title || !message}
              className="w-full bg-orange-500 hover:bg-orange-600 h-14 rounded-xl font-black text-lg gap-2 shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              ENVIAR NOTIFICAÇÃO AGORA
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Coluna de Templates */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-slate-900 text-white">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookTemplate className="text-orange-500" size={20} /> Templates Salvos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {templates.length > 0 ? templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleApplyTemplate(template.id)}
                className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm group-hover:text-orange-400 transition-colors">{template.title}</span>
                  <Sparkles size={14} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {template.message}
                </p>
              </button>
            )) : (
              <div className="text-center py-10 text-slate-500">
                <p className="text-xs">Nenhum template cadastrado.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Dica do Admin</p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Clique em um template para preencher automaticamente o formulário. Você pode ajustar o texto antes de realizar o envio final.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;