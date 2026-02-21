"use client";

import React, { useState, useEffect, useMemo } from 'react';

interface CountdownTimerProps {
  endsAt?: string | null;
  randomScarcity?: boolean;
  lotId?: string;
}

const CountdownTimer = ({ endsAt, randomScarcity = false, lotId }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Gera um tempo de escassez baseado no ID do lote para ser consistente
  const scarcityTimeInSeconds = useMemo(() => {
    if (!randomScarcity && endsAt) return null;
    
    // Semente baseada no ID do lote para que o tempo não mude a cada refresh
    // Se não houver ID, usa um valor fixo para evitar 0
    const seed = lotId ? lotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 12345;
    
    // Queremos entre 2 horas (7200s) e 10 horas (36000s)
    // (seed % range) + min
    const minTime = 7200; // 2 horas
    const maxRange = 28800; // Janela de 8 horas (10h - 2h)
    
    return (seed % maxRange) + minTime;
  }, [lotId, randomScarcity, endsAt]);

  useEffect(() => {
    let targetTime: number;

    if (endsAt) {
      targetTime = new Date(endsAt).getTime();
    } else {
      // Se não tem data, cria um tempo de expiração fictício baseado na hora atual + tempo de escassez
      // Para manter a consistência durante o dia, arredondamos a hora atual
      const startOfDay = new Date().setHours(0, 0, 0, 0);
      const offset = (scarcityTimeInSeconds || 7200) * 1000;
      
      // Isso faz com que o cronômetro expire em um momento específico do dia para aquele lote
      // mas pareça estar contando para o fim de um ciclo
      const now = Date.now();
      targetTime = now + offset;
      
      // Se o tempo gerado for muito curto (menos de 1h devido ao cálculo), adicionamos um ciclo
      if (targetTime - now < 3600000) {
        targetTime += 14400000; // +4 horas
      }
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
  }, [endsAt, scarcityTimeInSeconds]);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;