"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, User, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface WhatsAppManagerProps {
  user: {
    id: string;
    full_name: string;
    phone: string;
  };
}

const WhatsAppManager = ({ user }: WhatsAppManagerProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase.from('whatsapp_templates').select('*').order('name');
      if (data) setTemplates(data);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  const handleApplyTemplate = (content: string) => {
    const firstName = user.full_name?.split(' ')[0] || 'Cliente';
    const personalized = content.replace(/{nome}/g, firstName);
    setMessage(personalized);
  };

  const handleSendWhatsApp = () => {
    if (!user.phone) {
      toast({ variant: "destructive", title: "Erro", description: "Usuário sem telefone." });
      return;
    }

    const cleanPhone = user.phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
          <User size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destinatário</p>
          <p className="font-bold text-slate-900">{user.full_name}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-black text-slate-400 uppercase ml-1">Templates Rápidos</Card.Label>
        <div className="flex flex-wrap gap-2">
          {loading ? <Loader2 className="animate-spin h-4 w-4 text-slate-300" /> : 
            templates.map((t) => (
              <Button
                key={t.id}
                variant="outline"
                size="sm"
                onClick={() => handleApplyTemplate(t.content)}
                className="text-[10px] h-8 rounded-xl border-green-100 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all"
              >
                <Sparkles size={10} className="mr-1.5" /> {t.name}
              </Button>
            ))
          }
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black text-slate-400 uppercase ml-1">Mensagem</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Selecione um template ou digite aqui..."
          className="min-h-[150px] rounded-2xl border-slate-200 focus:ring-green-500 focus:border-green-500 text-sm"
        />
      </div>

      <Button
        onClick={handleSendWhatsApp}
        disabled={!message || !user.phone}
        className="w-full bg-green-500 hover:bg-green-600 text-white h-14 rounded-2xl font-black gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
      >
        <MessageCircle size={20} />
        ENVIAR PARA WHATSAPP
      </Button>
    </div>
  );
};

const Label = ({ children, className }: any) => <label className={cn("block text-sm font-medium text-slate-700", className)}>{children}</label>;

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default WhatsAppManager;