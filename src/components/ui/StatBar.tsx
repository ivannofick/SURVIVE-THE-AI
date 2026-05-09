import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface StatBarProps {
  label: string;
  value: number;
  icon: string;
  color?: 'cyan' | 'danger' | 'warning';
}

export function StatBar({ label, value, icon, color = 'cyan' }: StatBarProps) {
  const colorMap = {
    cyan: 'bg-neon-cyan',
    danger: 'bg-danger',
    warning: 'bg-amber-500',
  };

  const glowMap = {
    cyan: 'shadow-[0_0_10px_rgba(0,242,255,0.5)]',
    danger: 'shadow-[0_0_10px_rgba(255,0,51,0.5)]',
    warning: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]',
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
        <span className="flex items-center gap-1">
          <i className={cn(icon, color === 'cyan' ? 'text-neon-cyan' : color === 'danger' ? 'text-danger' : 'text-amber-500')}></i>
          {label}
        </span>
        <span className={cn(value < 30 ? 'text-danger font-bold animate-pulse' : 'text-zinc-300')}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-700/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full transition-colors duration-500",
            colorMap[color],
            value < 30 ? 'bg-danger shadow-[0_0_10px_rgba(255,0,51,0.8)]' : glowMap[color]
          )}
        />
      </div>
    </div>
  );
}
