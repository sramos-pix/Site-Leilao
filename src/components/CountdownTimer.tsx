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
      // Gera um tempo aleatório entre 5 min (300s) e 15 min (900s) para urgência máxima
      initialSeconds = Math.floor(Math.random() * (900 - 300) + 300);
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

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (h > 0) {
      return `${h}h ${pad(m)}m ${pad(s)}s`;
    }
    return `${pad(m)}m ${pad(s)}s`;
  };

  return (
    <span className={secondsLeft < 300 ? "text-red-500 font-bold animate-pulse" : ""}>
      {formatTime(secondsLeft)}
    </span>
  );
};

export default CountdownTimer;