import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ChoiceButtonProps {
  key?: string | number;
  text: string;
  risk: 'low' | 'medium' | 'high';
  onClick?: () => void;
  disabled?: boolean;
}

export function ChoiceButton({ text, risk, onClick, disabled }: ChoiceButtonProps) {
  const borderColors = {
    low: 'border-emerald-500/30 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    medium: 'border-neon-cyan/30 hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,242,255,0.2)]',
    high: 'border-danger/30 hover:border-danger hover:shadow-[0_0_20px_rgba(255,0,51,0.2)]',
  };

  const riskColors = {
    low: 'text-emerald-500',
    medium: 'text-neon-cyan',
    high: 'text-danger',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full p-3 sm:p-4 rounded-xl border bg-zinc-900/40 text-left transition-all duration-300 group",
        disabled ? "opacity-50 cursor-not-allowed border-zinc-800" : borderColors[risk]
      )}
    >
      <div className="flex flex-col gap-0.5 sm:gap-1 pr-6">
        <span className={cn("text-[8px] sm:text-[10px] uppercase tracking-widest font-mono font-bold", riskColors[risk])}>
          risiko {risk === 'low' ? 'rendah' : risk === 'medium' ? 'sedang' : 'tinggi'}
        </span>
        <span className="text-[13px] sm:text-sm text-zinc-100 font-medium group-hover:text-white transition-colors line-clamp-2">
          {text}
        </span>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <i className="ri-arrow-right-line text-zinc-400 group-hover:text-white"></i>
      </div>
    </motion.button>
  );
}
