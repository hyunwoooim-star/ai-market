'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}

export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
  duration = 800,
}: Props) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const startValue = prevValue.current;
    const diff = value - startValue;
    if (Math.abs(diff) < 0.001) {
      setDisplay(value);
      prevValue.current = value;
      return;
    }

    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * eased;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
        prevValue.current = value;
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const isUp = value > prevValue.current;
  const isDown = value < prevValue.current;

  return (
    <span
      className={`font-mono tabular-nums transition-colors duration-300 ${
        isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : ''
      } ${className}`}
    >
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}
