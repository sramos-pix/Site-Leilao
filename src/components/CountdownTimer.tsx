"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endsAt: string;
  onEnd?: () => void;
}

const CountdownTimer = ({ endsAt, onEnd }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endsAt) - +new Date();
      
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
    calculateTimeLeft(); // Execução inicial imediata

    return () => clearInterval(timer);
  }, [endsAt, onEnd]);

  return (
    <div className="text-3xl font-mono font-bold tracking-wider">
      {timeLeft}
    </div>
  );
};

export default CountdownTimer;