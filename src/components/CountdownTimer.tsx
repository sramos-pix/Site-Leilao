"use client";

import React, { useState, useEffect, useMemo } from 'react';

interface CountdownTimerProps {
  endsAt: string | null;
  lotId?: string;
  onEnd?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endsAt, lotId, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState<string>('Calculando...');

  // Gera uma data de encerramento falsa, porém estável (não reseta ao atualizar a página)
  const effectiveEndsAt = useMemo(() => {
    if (endsAt) return endsAt;
    
    if (!lotId) {
      // Fallback genérico se não houver ID
      return new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    }

    // Cria um "hash" numérico baseado no ID do lote para gerar sempre o mesmo tempo para o mesmo lote
    let hash = 0;
    for (let i = 0; i < lotId.length; i++) {
      hash = lotId.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    
    // Define uma duração aleatória entre 2h e 24h
    const minDuration = 2 * 60 * 60 * 1000; // 2 horas em milissegundos
    const range = 22 * 60 * 60 * 1000; // 22 horas de variação
    const randomDuration = minDuration + (hash % range);
    
    // Pega o início do dia de hoje
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Define o horário alvo
    let targetTime = startOfDay + randomDuration;
    
    // Se o horário alvo de hoje já passou, joga para amanhã (cria um loop infinito realista)
    if (targetTime < now.getTime()) {
       targetTime += 24 * 60 * 60 * 1000;
    }
    
    return new Date(targetTime).toISOString();
  }, [endsAt, lotId]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(effectiveEndsAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        if (onEnd) onEnd();
        return 'Encerrado';
      }

      // Cálculos de tempo
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Formatação com zero à esquerda
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');

      // Se tiver mais de 1 dia, mostra os dias na frente
      if (days > 0) {
        return `${days}d ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
      }

      // Se for menos de 1 dia, mostra apenas HH:MM:SS
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    // Atualiza imediatamente para não esperar 1 segundo
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft === 'Encerrado') {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [effectiveEndsAt, onEnd]);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;