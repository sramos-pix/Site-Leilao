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
      // Gera entre 5 e 55 minutos aleatórios (nunca horas)
      const randomMinutes = Math.floor(Math.random() * 50) + 5;
      const date = new Date();
      date.setMinutes(date.getMinutes() + randomMinutes);
      date.setSeconds(0); // Zera segundos para começar limpo
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

      // Forçamos apenas minutos e segundos para gerar escassez visual
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
      <div className="bg-red-600 text-white px-3 py-0.5 rounded-lg text-[10px] font-black animate-pulse">
        FINALIZANDO
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <div className="flex flex-col items-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1.5 min-w-[35px]">
          <span className="text-lg font-black tracking-tighter text-orange-500 leading-none">
            {timeLeft.m}
          </span>
        </div>
        <span className="text-[7px] font-bold text-slate-400 mt-0.5 uppercase">Min</span>
      </div>

      <span className="text-sm font-black text-white/30 mb-3">:</span>

      <div className="flex flex-col items-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1.5 min-w-[35px]">
          <span className="text-lg font-black tracking-tighter text-red-500 leading-none animate-pulse">
            {timeLeft.s}
          </span>
        </div>
        <span className="text-[7px] font-bold text-slate-400 mt-0.5 uppercase">Seg</span>
      </div>
    </div>
  );
};

export default CountdownTimer;