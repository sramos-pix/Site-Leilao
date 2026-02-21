"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endsAt: string | null;
  lotId?: string;
  onEnd?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endsAt, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState<string>('Calculando...');

  useEffect(() => {
    if (!endsAt) {
      setTimeLeft('Tempo não definido');
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(endsAt).getTime() - new Date().getTime();

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
  }, [endsAt, onEnd]);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;