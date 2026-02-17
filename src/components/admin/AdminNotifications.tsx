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
import { Bell, Send, Loader2, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminNotifications = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, email');
      if (data) setUsers(data);
    };
    fetchUsers();
  }, []);

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
        type: 'info'
      }));

      const { error } = await supabase.from('notifications').insert(notifications);

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Notificação enviada com sucesso." });
      setTitle('');
      setMessage('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="text-orange-500" size={20} /> Enviar Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Destinatário</label>
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
            <label className="text-sm font-bold text-slate-700">Título</label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Novo Leilão Disponível!"
              className="rounded-xl h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Mensagem</label>
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite o conteúdo da notificação..."
              className="rounded-xl min-h-[120px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !title || !message}
            className="w-full bg-orange-500 hover:bg-orange-600 h-12 rounded-xl font-bold gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            Enviar Notificação
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminNotifications;