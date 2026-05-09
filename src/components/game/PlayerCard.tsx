import { motion } from 'motion/react';
import { Player } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface PlayerCardProps {
  key?: string | number;
  player: Player;
  isHost?: boolean;
  className?: string;
}

export function PlayerCard({ player, isHost, className }: PlayerCardProps) {
  return (
    <motion.div
      layout
      className={cn(
        "flex items-center gap-4 p-3 rounded-xl glass border-zinc-800/50 hover:border-zinc-700/50 transition-colors",
        !player.isAlive && "opacity-50 grayscale",
        className
      )}
    >
      <div className="relative">
        <img src={player.avatar} alt={player.username} className="w-12 h-12 rounded-lg bg-zinc-800" />
        {isHost && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
            Host
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-zinc-100">{player.username}</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded font-mono uppercase",
            player.isReady ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"
          )}>
            {player.isReady ? 'Siap' : 'Menunggu'}
          </span>
        </div>
        <div className="flex gap-1 mt-1 justify-between items-center">
           <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <i className="ri-heart-fill text-[10px] text-danger"></i>
                <span className="text-[10px] text-zinc-400 font-mono">{player.hp}</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="ri-brain-line text-[10px] text-purple-400"></i>
                <span className="text-[10px] text-zinc-400 font-mono">{player.sanity}</span>
              </div>
           </div>
           {!player.isAlive && (
              <span className="text-[10px] text-danger font-bold uppercase tracking-tighter">Meninggal</span>
           )}
        </div>
      </div>
    </motion.div>
  );
}
