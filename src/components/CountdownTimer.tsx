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
    let initialSeconds = 0;

    if (endsAt) {
      const end = new Date(endsAt).getTime();
      const now = new Date().getTime();
      initialSeconds = Math.max(0, Math.floor((end - now) / 1000));
    } else if (randomScarcity) {
      // Usa o ID do lote para gerar um tempo "aleatório" mas consistente para aquele veículo
      // Isso garante que o tempo seja o mesmo na listagem e no detalhe
      const seed = lotId ? (typeof lotId === 'string' ? lotId.length : lotId) : Math.random();
      const baseTime = 300; // 5 minutos mínimo
      const variance = (Number(seed) % 10) * 60; // Adiciona até 10 minutos baseados no ID
      initialSeconds = baseTime + variance;
    } else {
      initialSeconds = 7200; // 2 horas padrão
    }

    setSecondsLeft(initialSeconds);
  }, [randomScarcity, endsAt, lotId]);

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