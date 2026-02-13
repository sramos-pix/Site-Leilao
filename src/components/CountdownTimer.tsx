"use client";

import React, { useState, useEffect, useMemo } from 'react';

interface CountdownTimerProps {
  endsAt?: string;
  randomScarcity?: boolean;
  onEnd?: () => void;
}

const CountdownTimer = ({ endsAt, randomScarcity, onEnd }: CountdownTimerProps) => {
  // Gera um tempo alvo aleatório SEMPRE inferior a 1 hora se randomScarcity for true
  const targetDate = useMemo(() => {
    if (randomScarcity) {
      // Gera entre 5 e 55 minutos aleatórios
      const randomMinutes = Math.floor(Math.random() * 50) + 5;
      const date = new Date();
      date.setMinutes(date.getMinutes() + randomMinutes);
      date.setSeconds(0);
      return date.toISOString();
    }
    return endsAt || new Date().toISOString();
  }, [endsAt, randomScarcity]);

  const [timeLeft, setTimeLeft] = useState<{m: string, s: string} | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft(null);
        if (onEnd) onEnd();
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (n: number) => n.toString().padStart(2, '0');
      
      setTimeLeft({
        m: pad(minutes),
        s: pad(seconds)
      });
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [targetDate, onEnd]);

  if (!timeLeft) {
    return (
      <div className="bg-red-600 text-white px-4 py-1 rounded-lg text-xs font-black animate-pulse">
        FINALIZANDO
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex flex-col items-center">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-2 min-w-[45px] shadow-inner">
          <span className="text-2xl font-black tracking-tighter text-orange-400 leading-none">
            {timeLeft.m}
          </span>
        </div>
        <span className="text-[9px] font-black text-white/70 mt-1 uppercase tracking-widest">Min</span>
      </div>

      <span className="text-xl font-black text-white/40 mb-5">:</span>

      <div className="flex flex-col items-center">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-2 min-w-[45px] shadow-inner">
          <span className="text-2xl font-black tracking-tighter text-red-500 leading-none animate-pulse">
            {timeLeft.s}
          </span>
        </div>
        <span className="text-[9px] font-black text-white/70 mt-1 uppercase tracking-widest">Seg</span>
      </div>
    </div>
  );
};

export default CountdownTimer;