"use client";

import React from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Wins = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
        <Trophy className="text-orange-500" /> Meus Arremates
      </h1>
      <Card className="border-dashed border-2 bg-transparent">
        <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Trophy size={48} className="mb-4 opacity-20" />
          <p>Você ainda não possui lotes arrematados.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wins;