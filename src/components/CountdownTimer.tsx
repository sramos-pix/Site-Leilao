"use client";

import React, { useState, useEffect, useMemo } from 'react';

interface CountdownTimerProps {
  endsAt?: string | null;
  randomScarcity?: boolean;
  lotId?: string;
}

const CountdownTimer = ({ endsAt, randomScarcity = false, lotId }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Gera um tempo de escassez baseado no ID do lote para ser consistente por sessão
  const scarcityTime = useMemo(() => {
    if (!randomScarcity && endsAt) return null;
    
    // Semente baseada no ID do lote para que o tempo não mude a cada refresh
    const seed = lotId ? lotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random();
    // Retorna um valor entre 120 e 600 segundos (2 a 10 minutos)
    return (seed % 480) + 120;
  }, [lotId, randomScarcity, endsAt]);

  useEffect(() => {
    let targetTime: number;

    if (endsAt) {
      targetTime = new Date(endsAt).getTime();
    } else {
      // Se não tem data, cria um tempo de expiração fictício (agora + scarcityTime)
      targetTime = Date.now() + (scarcityTime || 300) * 1000;
    }

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const formatted = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');

      setTimeLeft(formatted);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endsAt, scarcityTime]);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;