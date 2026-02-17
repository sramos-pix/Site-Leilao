"use client";

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Trophy, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MyWins = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            <Trophy size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Meus Arremates</h1>
            <p className="text-slate-500">Acompanhe os veículos que você arrematou.</p>
          </div>
        </div>

        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <Car size={48} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Nenhum arremate ainda</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Você ainda não venceu nenhum leilão. Continue dando lances para conquistar seu próximo veículo!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MyWins;