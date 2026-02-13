"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  randomScarcity?: boolean;
  endsAt?: string | Date;
}

const CountdownTimer = ({ randomScarcity = false, endsAt }: CountdownTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    let initialSeconds = 0;

    if (endsAt) {
      const end = new Date(endsAt).getTime();
      const now = new Date().getTime();
      initialSeconds = Math.max(0, Math.floor((end - now) / 1000));
    } else if (randomScarcity) {
      // Gera um tempo aleatório entre 30 min e 4 horas para cada instância
      initialSeconds = Math.floor(Math.random() * (14400 - 1800) + 1800);
    } else {
      initialSeconds = 7200; // 2 horas padrão
    }

    setSecondsLeft(initialSeconds);
  }, [randomScarcity, endsAt]);

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

    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    return `${m}m ${s}s`;
  };

  return <span>{formatTime(secondsLeft)}</span>;
};

export default CountdownTimer;