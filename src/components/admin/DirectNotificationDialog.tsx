"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Bell, Send, Loader2, BookTemplate } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DirectNotificationDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DirectNotificationDialog = ({ user, open, onOpenChange }: DirectNotificationDialogProps) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('notification_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setTemplates(data);
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setTitle(template.title);
      setMessage(template.message);
      setType(template.type || 'info');
    }
  };

  const handleSend = async () => {
    if (!title || !message) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('notifications').insert([{
        user_id: user.id,
        title,
        message,
        type
      }]);

      if (error) throw error;

      toast.success(`Notificação enviada para ${user.full_name || user.email}`);
      setTitle('');
      setMessage('');
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Erro ao enviar: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="text-orange-500" size={20} /> 
            Notificar {user.full_name || 'Usuário'}
          </DialogTitle>
          <DialogDescription>
            Envie uma notificação direta para o painel do usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase">Template Rápido</label>
            <Select onValueChange={handleApplyTemplate}>
              <SelectTrigger className="rounded-xl">
                <div className="flex items-center gap-2">
                  <BookTemplate size={16} className="text-slate-400" />
                  <SelectValue placeholder="Escolher um template..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Tipo</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Título</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da notificação"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase">Mensagem</label>
              <Textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conteúdo da mensagem..."
                className="rounded-xl min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancelar
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !title || !message}
            className="bg-orange-500 hover:bg-orange-600 rounded-xl gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Send size={16} />}
            Enviar Agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DirectNotificationDialog;