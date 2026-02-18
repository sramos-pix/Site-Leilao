"use client";

import React from 'react';
import { 
  Mail, Phone, MapPin, MessageSquare, 
  Clock, Send, Loader2, ShieldCheck, 
  Gavel, CheckCircle2, Building2, Award
} from 'lucide-react';
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
      <main className="flex-1">
        {/* Hero Section Institucional */}
        <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <Badge className="bg-orange-500 mb-6 px-4 py-1 rounded-full font-bold">INSTITUCIONAL</Badge>
              <h1 className="text-4xl md:text-6xl font-black mb-6">Transparência e <span className="text-orange-500">Segurança</span> em cada lance.</h1>
              <p className="text-xl text-slate-400 leading-relaxed">
                A AutoBid nasceu com o propósito de democratizar o acesso a leilões de veículos, unindo tecnologia de ponta com processos auditados e seguros.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-500/10 blur-[120px] -translate-y-1/2" />
        </section>

        {/* Pilares de Confiança */}
        <section className="py-16 -mt-10 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, title: "Procedência Garantida", desc: "Todos os veículos são periciados e possuem laudo cautelar aprovado." },
                { icon: Gavel, title: "Leilão Auditado", desc: "Processos transparentes com acompanhamento jurídico em todas as etapas." },
                { icon: Award, title: "Excelência no Pátio", desc: "Infraestrutura completa para armazenamento e visitação dos lotes." }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:border-orange-200 transition-all">
                  <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Informações de Contato */}
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <Building2 className="text-orange-500" size={24} /> Atendimento Oficial
                  </h3>
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><Phone size={20} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone Central</p>
                        <p className="font-bold text-slate-900">0800 123 4567</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><Mail size={20} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Suporte</p>
                        <p className="font-bold text-slate-900">suporte@autobid.com.br</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><Clock size={20} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário de Operação</p>
                        <p className="font-bold text-slate-900">Seg a Sex, 09h às 18h</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-lg shadow-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 size={24} />
                    <h3 className="text-xl font-bold">Leilão Seguro</h3>
                  </div>
                  <p className="text-orange-50 text-sm leading-relaxed mb-6">
                    Nossa plataforma utiliza criptografia de ponta a ponta e verificação de identidade rigorosa para garantir a legitimidade de cada oferta.
                  </p>
                  <div className="flex items-center gap-4 opacity-80">
                    <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center font-black text-xs">SSL</div>
                    <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center font-black text-xs">256bit</div>
                  </div>
                </div>
              </div>

              {/* Formulário */}
              <div className="lg:col-span-2">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold text-slate-900">Envie sua Mensagem</h3>
                    <p className="text-slate-500 mt-2">Dúvidas sobre lotes, pagamentos ou retirada? Nossa equipe responde rápido.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Nome Completo</Label>
                        <Input placeholder="Seu nome" required className="h-14 rounded-2xl border-slate-200 focus:border-orange-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">E-mail</Label>
                        <Input type="email" placeholder="seu@email.com" required className="h-14 rounded-2xl border-slate-200 focus:border-orange-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-1">Assunto</Label>
                      <Input placeholder="Como podemos ajudar?" required className="h-14 rounded-2xl border-slate-200 focus:border-orange-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-1">Mensagem</Label>
                      <Textarea placeholder="Escreva sua dúvida ou sugestão detalhadamente..." required className="min-h-[150px] rounded-2xl border-slate-200 focus:border-orange-500" />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-8 rounded-2xl text-lg font-black shadow-lg shadow-orange-100 transition-all active:scale-[0.98]">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" size={20} /> ENVIAR MENSAGEM AGORA</>}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("inline-block text-[10px] tracking-widest text-white px-3 py-1 rounded-full", className)}>
    {children}
  </span>
);

export default Contact;