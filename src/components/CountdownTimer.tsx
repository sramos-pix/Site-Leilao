"use client";

import React, { useState, useEffect, useMemo } from 'react';

interface CountdownTimerProps {
  endsAt?: string;
  randomScarcity?: boolean;
  onEnd?: () => void;
}

const CountdownTimer = ({ endsAt, randomScarcity, onEnd }: CountdownTimerProps) => {
  // Se randomScarcity for true, gera um tempo aleatório entre 5 e 45 minutos para gerar urgência
  const targetDate = useMemo(() => {
    if (randomScarcity) {
      const randomMinutes = Math.floor(Math.random() * 40) + 5;
      return new Date(Date.now() + randomMinutes * 60000).toISOString();
    }
    return endsAt || new Date().toISOString();
  }, [endsAt, randomScarcity]);

  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft('ENCERRADO');
        if (onEnd) onEnd();
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const pad = (n: number) => n.toString().padStart(2, '0');
      
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [targetDate, onEnd]);

  return (
    <div className="text-3xl font-mono font-bold tracking-wider">
      {timeLeft}
    </div>
  );
};

export default CountdownTimer;