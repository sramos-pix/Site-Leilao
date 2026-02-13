"use client";

import React, { useState, useEffect, useMemo } from 'react';

interface CountdownTimerProps {
  endsAt?: string;
  randomScarcity?: boolean;
  onEnd?: () => void;
}

const CountdownTimer = ({ endsAt, randomScarcity, onEnd }: CountdownTimerProps) => {
  const targetDate = useMemo(() => {
    if (randomScarcity) {
      const randomMinutes = Math.floor(Math.random() * 40) + 5;
      return new Date(Date.now() + randomMinutes * 60000).toISOString();
    }
    return endsAt || new Date().toISOString();
  }, [endsAt, randomScarcity]);

  const [timeLeft, setTimeLeft] = useState<{h: string, m: string, s: string} | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft(null);
        if (onEnd) onEnd();
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (n: number) => n.toString().padStart(2, '0');
      
      setTimeLeft({
        h: pad(hours),
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
      <div className="bg-red-600 text-white px-4 py-1 rounded-lg text-sm font-black animate-pulse">
        ENCERRADO
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex flex-col items-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2 min-w-[50px]">
          <span className="text-2xl md:text-3xl font-black tracking-tighter text-orange-500 leading-none">
            {timeLeft.h}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Hrs</span>
      </div>
      
      <span className="text-xl font-black text-white/30 mb-5">:</span>

      <div className="flex flex-col items-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2 min-w-[50px]">
          <span className="text-2xl md:text-3xl font-black tracking-tighter text-orange-500 leading-none">
            {timeLeft.m}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Min</span>
      </div>

      <span className="text-xl font-black text-white/30 mb-5">:</span>

      <div className="flex flex-col items-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2 min-w-[50px]">
          <span className="text-2xl md:text-3xl font-black tracking-tighter text-red-500 leading-none animate-pulse">
            {timeLeft.s}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Seg</span>
      </div>
    </div>
  );
};

export default CountdownTimer;