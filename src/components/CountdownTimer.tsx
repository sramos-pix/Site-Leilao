"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CountdownTimerProps {
  endsAt: string | null;
  randomScarcity?: boolean;
  lotId?: string;
}

const CountdownTimer = ({ endsAt, randomScarcity = false, lotId }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Se não houver data de encerramento, o leilão é por tempo indeterminado
    if (!endsAt) {
      setTimeLeft("Tempo Indeterminado");
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(endsAt) - +new Date();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Encerrado");
        
        // Se o lote expirou e temos o ID, atualizamos o status no banco se necessário
        if (lotId) {
          supabase.from('lots').update({ status: 'finished' }).eq('id', lotId).then();
        }
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [endsAt, lotId]);

  return (
    <span className={isExpired ? "text-slate-400" : ""}>
      {timeLeft}
    </span>
  );
};

export default CountdownTimer;