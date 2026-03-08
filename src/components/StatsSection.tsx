"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Car, Users, TrendingUp, ShieldCheck } from 'lucide-react';

const stats = [
  {
    icon: Car,
    value: 1247,
    suffix: '+',
    label: 'Veículos Arremados',
    color: 'text-orange-500',
  },
  {
    icon: TrendingUp,
    value: 38,
    prefix: 'R$ ',
    suffix: 'M+',
    label: 'em Transações Realizadas',
    color: 'text-emerald-500',
  },
  {
    icon: Users,
    value: 4892,
    suffix: '+',
    label: 'Compradores Ativos',
    color: 'text-blue-500',
  },
  {
    icon: ShieldCheck,
    value: 100,
    suffix: '%',
    label: 'Pagamentos via PIX Seguro',
    color: 'text-orange-500',
  },
];

function useCountUp(target: number, duration = 1800, started: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, started]);
  return count;
}

const StatCard = ({ stat, started }: { stat: typeof stats[0]; started: boolean }) => {
  const count = useCountUp(stat.value, 1800, started);
  const Icon = stat.icon;
  return (
    <div className="flex flex-col items-center text-center gap-2 p-6">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100 mb-1`}>
        <Icon className={`h-6 w-6 ${stat.color}`} />
      </div>
      <span className="text-4xl font-black text-slate-900 tracking-tight">
        {stat.prefix || ''}{count.toLocaleString('pt-BR')}{stat.suffix || ''}
      </span>
      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
    </div>
  );
};

const StatsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-14 bg-white border-y border-slate-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
