"use client";

import React from 'react';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Favorites = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
        <Heart className="text-orange-500" /> Meus Favoritos
      </h1>
      <Card className="border-dashed border-2 bg-transparent">
        <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Heart size={48} className="mb-4 opacity-20" />
          <p>Sua lista de favoritos está vazia.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Favorites;