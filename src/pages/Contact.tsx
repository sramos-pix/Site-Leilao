"use client";

import React from 'react';
import { Mail, Phone, MapPin, MessageSquare, Clock, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Mensagem enviada!",
        description: "Nossa equipe entrará em contato em até 24 horas úteis."
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Fale Conosco</h1>
              <p className="text-xl text-slate-500">Estamos aqui para ajudar você em cada etapa do seu leilão.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold mb-6">Canais de Atendimento</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Phone size={20} /></div>
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Telefone</p><p className="font-bold">0800 123 4567</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Mail size={20} /></div>
                      <div><p className="text-xs font-bold text-slate-400 uppercase">E-mail</p><p className="font-bold">suporte@autobid.com.br</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Clock size={20} /></div>
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Horário</p><p className="font-bold">Seg a Sex, 09h às 18h</p></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                  <MessageSquare className="text-orange-500 mb-4" size={32} />
                  <h3 className="text-xl font-bold mb-2">Dúvidas Frequentes</h3>
                  <p className="text-slate-400 text-sm mb-6">Confira nossa central de ajuda para respostas rápidas sobre pagamentos e retiradas.</p>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl">Acessar FAQ</Button>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-2xl font-bold mb-8">Envie uma Mensagem</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input placeholder="Seu nome" required className="h-14 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input type="email" placeholder="seu@email.com" required className="h-14 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Assunto</Label>
                      <Input placeholder="Como podemos ajudar?" required className="h-14 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mensagem</Label>
                      <Textarea placeholder="Escreva sua dúvida ou sugestão..." required className="min-h-[150px] rounded-xl" />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 rounded-2xl text-lg font-bold shadow-lg shadow-orange-100">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" size={20} /> Enviar Mensagem</>}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;