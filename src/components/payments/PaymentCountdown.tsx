"use client";

import React from "react";
import { cn } from "@/lib/utils";

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export default function PaymentCountdown({
  expiresAtMs,
  onExpire,
  className,
}: {
  expiresAtMs: number;
  onExpire?: () => void;
  className?: string;
}) {
  const [nowMs, setNowMs] = React.useState(() => Date.now());
  const expiredRef = React.useRef(false);

  React.useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const secondsLeft = (expiresAtMs - nowMs) / 1000;

  React.useEffect(() => {
    if (secondsLeft <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire?.();
    }
  }, [secondsLeft, onExpire]);

  const isExpired = secondsLeft <= 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border px-3 py-2",
        isExpired
          ? "border-red-200 bg-red-50 text-red-700"
          : secondsLeft <= 60
            ? "border-orange-200 bg-orange-50 text-orange-700"
            : "border-slate-200 bg-slate-50 text-slate-700",
        className,
      )}
      aria-live="polite"
    >
      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
        Tempo p/ pagar
      </span>
      <span className="font-black tabular-nums">{formatMMSS(secondsLeft)}</span>
    </div>
  );
}