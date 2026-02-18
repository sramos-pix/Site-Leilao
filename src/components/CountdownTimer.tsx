"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  randomScarcity?: boolean;
  endsAt?: string | Date;
  lotId?: string | number;
}

const CountdownTimer = ({ randomScarcity = false, endsAt, lotId }: CountdownTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    // Prioridade 1: Data real vinda do banco de dados
    if (endsAt) {
      const end = new Date(endsAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setSecondsLeft(diff);
      return;
    }

    // Prioridade 2: Escassez aleatória (Máximo 24 horas)
    if (randomScarcity) {
      // Gera um "seed" baseado no ID do lote para o tempo ser persistente para aquele veículo
      const idNum = typeof lotId === 'string' 
        ? lotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) 
        : (Number(lotId) || 1);
      
      const minSeconds = 1800; // 30 minutos (mínimo)
      const maxSeconds = 86400; // 24 horas (máximo)
      const range = maxSeconds - minSeconds;
      
      // O cálculo garante que o tempo fique entre 30min e 24h
      const randomFactor = (idNum * 1337) % range;
      setSecondsLeft(minSeconds + randomFactor);
    } else {
      setSecondsLeft(7200); // 2 horas padrão caso nada seja informado
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

    // Alerta visual crítico nos últimos 30 segundos
    if (totalSeconds <= 30 && totalSeconds > 0) {
      return `BATIDA DO MARTELO: ${pad(s)}s`;
    }

    if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
    return `${pad(m)}m ${pad(s)}s`;
  };

  return (
    <span className={cn(
      "transition-all duration-300",
      secondsLeft < 3600 ? "text-white font-bold animate-pulse" : "",
      secondsLeft <= 30 && secondsLeft > 0 ? "text-yellow-400 scale-110 inline-block" : ""
    )}>
      {formatTime(secondsLeft)}
    </span>
  );
};

export default CountdownTimer;