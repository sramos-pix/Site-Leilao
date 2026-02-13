"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  randomScarcity?: boolean;
  endsAt?: string | Date;
  lotId?: string | number;
}

const CountdownTimer = ({ randomScarcity = false, endsAt, lotId }: CountdownTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (endsAt) {
      const end = new Date(endsAt).getTime();
      const now = new Date().getTime();
      setSecondsLeft(Math.max(0, Math.floor((end - now) / 1000)));
      return;
    }

    if (randomScarcity) {
      // Gera um tempo curto (entre 5 e 15 minutos) baseado no ID do lote para ser persistente
      const idNum = typeof lotId === 'string' ? lotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : (Number(lotId) || 0);
      const baseMinutes = 5;
      const extraMinutes = idNum % 10;
      setSecondsLeft((baseMinutes + extraMinutes) * 60);
    } else {
      setSecondsLeft(7200); // 2 horas padrão
    }
  }, [endsAt, randomScarcity, lotId]);

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

    if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
    return `${pad(m)}m ${pad(s)}s`;
  };

  return (
    <span className={secondsLeft < 300 ? "text-white font-bold animate-pulse" : ""}>
      {formatTime(secondsLeft)}
    </span>
  );
};

export default CountdownTimer;