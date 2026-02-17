"use client";

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ShieldCheck, Upload, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const VerifyAccount = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Verificação de Identidade</h1>
        <p className="text-slate-500 mb-8">Para participar dos leilões, precisamos verificar sua identidade.</p>
        
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8 text-center">
            <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-orange-500" size={40} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Envio de Documentos</h2>
            <p className="text-slate-500 mb-8">Prepare uma foto legível do seu RG ou CNH (frente e verso) e uma selfie segurando o documento.</p>
            
            <div className="grid gap-4">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 font-bold">
                <Upload className="mr-2" size={18} /> Carregar Documentos
              </Button>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
                <Clock size={14} /> Prazo de análise: até 24h úteis
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default VerifyAccount;