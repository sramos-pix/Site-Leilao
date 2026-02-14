"use client";

import React from 'react';
import { 
  User, Mail, Phone, MapPin, 
  ShieldCheck, FileText, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const Profile = () => {
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setProfile(data);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
        <Footer />
      </div>
    );
  }

  const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: any }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
        <Icon size={20} className="text-slate-500" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-slate-900 font-medium break-all">{value || 'Não informado'}</p>
      </div>
    </div>
  );

  const displayCpf = profile?.document_id || profile?.cpf || profile?.document_number;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200 shrink-0">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">{profile?.full_name || 'Usuário'}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={cn(
                  "border-none px-3 py-1 rounded-full font-bold",
                  profile?.kyc_status === 'verified' ? "bg-green-100 text-green-600" : 
                  profile?.kyc_status === 'pending' ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-500"
                )}>
                  {profile?.kyc_status === 'verified' ? 'Conta Verificada' : 
                   profile?.kyc_status === 'pending' ? 'Verificação Pendente' : 'Aguardando Documentos'}
                </Badge>
                {profile?.created_at && (
                  <span className="text-slate-400 text-sm">• Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold w-full md:w-auto">Editar Perfil</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 px-8 py-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User size={20} className="text-orange-500" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <InfoRow icon={User} label="Nome Completo" value={profile?.full_name} />
              <InfoRow icon={FileText} label="CPF" value={displayCpf} />
              <InfoRow icon={Mail} label="E-mail" value={profile?.email} />
              <InfoRow icon={Phone} label="Telefone" value={profile?.phone} />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 px-8 py-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin size={20} className="text-orange-500" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <InfoRow icon={MapPin} label="CEP" value={profile?.zip_code || profile?.cep} />
              <InfoRow icon={MapPin} label="Cidade / UF" value={profile?.city ? `${profile.city} - ${profile.state || ''}` : null} />
              <InfoRow icon={MapPin} label="Endereço" value={profile?.address ? `${profile.address}${profile.number ? ', ' + profile.number : ''}` : null} />
              <InfoRow icon={MapPin} label="Bairro" value={profile?.neighborhood || profile?.district} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;