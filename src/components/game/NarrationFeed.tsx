import { motion, AnimatePresence } from 'motion/react';
import { Narration } from '@/src/types';
import { useEffect, useRef } from 'react';
import { cn } from '@/src/lib/utils';

interface NarrationFeedProps {
  narrations: Narration[];
}

export function NarrationFeed({ narrations }: NarrationFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [narrations]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-2 sm:pr-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
    >
      <AnimatePresence mode="popLayout">
        {narrations.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-1 sm:gap-2"
          >
            <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-mono tracking-widest uppercase">
              <span className={cn(
                "px-1 py-0.5 sm:px-1.5 rounded",
                n.type === 'ai' ? "bg-neon-cyan/20 text-neon-cyan" : 
                n.type === 'system' ? "bg-zinc-800 text-zinc-400" : 
                "bg-danger/20 text-danger"
              )}>
                {n.type === 'ai' ? 'XENON // ARCHITECT' : n.type === 'system' ? 'LOCAL // LOG' : 'THREAT // DETECTED'}
              </span>
              <span className="text-zinc-600">{n.timestamp}</span>
            </div>
            
            <p className={cn(
              "text-[13px] sm:text-sm leading-relaxed",
              n.type === 'ai' ? "text-zinc-100" : "text-zinc-400",
              i === narrations.length - 1 && "text-glow-cyan"
            )}>
              {n.text}
            </p>
            
            {i < narrations.length - 1 && (
              <div className="w-8 h-px bg-zinc-800 mt-2" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
