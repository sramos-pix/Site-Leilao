"use client";

import React, { useState, useEffect, useMemo } from 'react';

interface CountdownTimerProps {
  endsAt?: string | null;
  randomScarcity?: boolean;
  lotId?: string;
}

const CountdownTimer = ({ endsAt, randomScarcity = false, lotId }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Gera um tempo de escassez baseado no ID do lote para ser consistente e único
  const targetTimeMs = useMemo(() => {
    // Se houver uma data real de encerramento, usamos ela
    if (endsAt) return new Date(endsAt).getTime();

    // Caso contrário, geramos um tempo de escassez (2h a 24h)
    // Usamos o lotId como semente para que o valor seja sempre o mesmo para aquele carro
    const seed = lotId ? lotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 12345;
    
    const minSeconds = 2 * 60 * 60; // 2 horas
    const maxSeconds = 24 * 60 * 60; // 24 horas
    const range = maxSeconds - minSeconds;

    // Cálculo do offset único por veículo
    const uniqueOffsetSeconds = minSeconds + (seed % range);
    
    // Para manter a sensação de "contagem regressiva para hoje", baseamos no início da hora atual
    const now = new Date();
    const baseTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime();
    
    let finalTarget = baseTime + (uniqueOffsetSeconds * 1000);

    // Se o tempo gerado já passou ou está muito perto de acabar (menos de 30 min), jogamos para o próximo ciclo
    if (finalTarget - Date.now() < 1800000) {
      finalTarget += 3600000 * 4; // Adiciona 4 horas para garantir que nunca fique zerado
    }

    return finalTarget;
  }, [lotId, endsAt]);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const difference = targetTimeMs - now;

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
  }, [targetTimeMs]);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;