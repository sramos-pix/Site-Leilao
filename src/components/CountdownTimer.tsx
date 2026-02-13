"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  randomScarcity?: boolean;
  endsAt?: string | Date;
}

const CountdownTimer = ({ randomScarcity = false, endsAt }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (endsAt) {
      // Se houver uma data real, poderíamos calcular a diferença aqui.
      // Por enquanto, vamos manter o formato visual consistente.
      setTimeLeft(typeof endsAt === 'string' ? endsAt : '2h 15m');
      return;
    }

    const hours = randomScarcity ? Math.floor(Math.random() * 5) + 1 : 2;
    const minutes = Math.floor(Math.random() * 59);
    
    setTimeLeft(`${hours}h ${minutes}m`);
  }, [randomScarcity, endsAt]);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;