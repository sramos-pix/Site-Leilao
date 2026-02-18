"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  randomScarcity?: boolean;
  endsAt?: string | Date;
  lotId?: string | number;
}

const CountdownTimer = ({ randomScarcity = false, endsAt, lotId }: CountdownTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (endsAt) {
      const end = new Date(endsAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setSecondsLeft(diff);
      return;
    }

    if (randomScarcity) {
      // Gera um tempo aleatório entre 1h (3600s) e 12h (43200s) baseado no ID do lote para ser persistente por sessão
      const idNum = typeof lotId === 'string' 
        ? lotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) 
        : (Number(lotId) || Math.floor(Math.random() * 1000));
      
      const minSeconds = 3600; // 1 hora
      const maxSeconds = 43200; // 12 horas
      const range = maxSeconds - minSeconds;
      
      // Usa o ID para garantir que o mesmo lote tenha o mesmo tempo "aleatório"
      const randomFactor = (idNum * 1337) % range;
      setSecondsLeft(minSeconds + randomFactor);
    } else {
      setSecondsLeft(7200); // 2 horas padrão
    }
  }, [endsAt, randomScarcity, lotId]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (totalSeconds <= 30 && totalSeconds > 0) {
      return `BATIDA DO MARTELO: ${pad(s)}s`;
    }

    if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
    return `${pad(m)}m ${pad(s)}s`;
  };

  return (
    <span className={cn(
      secondsLeft < 3600 ? "text-white font-bold animate-pulse" : "",
      secondsLeft <= 30 && secondsLeft > 0 ? "text-yellow-400 scale-110 inline-block" : ""
    )}>
      {formatTime(secondsLeft)}
    </span>
  );
};

import { cn } from '@/lib/utils';
export default CountdownTimer;