"use client";

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  initialTime: string; // Formato "HH:MM:SS" ou uma data ISO
}

const CountdownTimer = ({ initialTime }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    // Se for uma string de tempo fixo (ex: 02:14:05), vamos simular o decréscimo
    // Em um cenário real, usaríamos a diferença entre a data final e agora.
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const parts = prev.split(':').map(Number);
        let [h, m, s] = parts;

        if (h === 0 && m === 0 && s === 0) {
          clearInterval(timer);
          return "ENCERRADO";
        }

        if (s > 0) {
          s--;
        } else {
          s = 59;
          if (m > 0) {
            m--;
          } else {
            m = 59;
            if (h > 0) h--;
          }
        }

        return [h, m, s]
          .map((v) => v.toString().padStart(2, '0'))
          .join(':');
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;