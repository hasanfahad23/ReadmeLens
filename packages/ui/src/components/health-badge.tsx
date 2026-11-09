import * as React from 'react';
import { cn } from '../lib/utils.js';

export interface HealthScoreBadgeProps {
  score: number;
  grade?: string;
  size?: 'sm' | 'md' | 'lg';
  showGrade?: boolean;
}

export function HealthScoreBadge({ score, grade, size = 'md', showGrade = true }: HealthScoreBadgeProps) {
  let color = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (score < 50) color = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  else if (score < 75) color = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  else if (score < 85) color = 'text-sky-400 border-sky-500/30 bg-sky-500/10';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1 font-semibold',
    lg: 'text-base px-4 py-1.5 font-bold',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border shadow-sm font-mono',
        color,
        sizeClasses[size]
      )}
      role="status"
      aria-label={`Documentation Health Score: ${score} out of 100`}
    >
      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      <span>{score}/100</span>
      {showGrade && grade && (
        <span className="px-1.5 py-0.2 rounded bg-black/30 text-xs uppercase font-sans">
          Grade {grade}
        </span>
      )}
    </div>
  );
}
