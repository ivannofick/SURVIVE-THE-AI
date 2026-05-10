import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/ui/GlassCard';
import { PlayerCard } from '../components/game/PlayerCard';
import { Player } from '../types';
import { cn } from '../lib/utils';
import { getRoom, getPlayers, updatePlayerReady, startRoom } from '../services/roomService';

export default function LobbyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const username = searchParams.get('username') || 'Survivor';
  const userId = searchParams.get('userId');
  
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [timer, setTimer] = useState(120);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/setup');
      return;
    }

    const unsubRoom = getRoom(roomId, (roomData) => {
      setRoom(roomData);
      if (roomData.status === 'playing') {
        const theme = roomData.theme;
        navigate(`/game?roomId=${roomId}&username=${encodeURIComponent(username)}&userId=${userId}&theme=${theme}`);
      }
    });

    const unsubPlayers = getPlayers(roomId, (playersData) => {
      setPlayers(playersData);
      const me = playersData.find(p => p.id === userId);
      if (me) setIsReady(me.isReady);
    });

    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(t);
          if (room?.hostId === userId) {
             handleStart();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      unsubRoom();
      unsubPlayers();
      clearInterval(t);
    };
  }, [roomId, userId, navigate, username]);

  const handleStart = async () => {
    if (roomId && userId) {
      await startRoom(roomId, userId);
    }
  };

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleReady = async () => {
    if (roomId && userId) {
      await updatePlayerReady(roomId, userId, !isReady);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-6 space-y-8 py-16">
      <button 
        onClick={() => navigate('/setup')}
        className="mb-8 p-2 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 font-mono text-xs uppercase self-start"
      >
        <i className="ri-arrow-left-line"></i>
        Kembali
      </button>

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-800/50 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-neon-cyan">
             <i className="ri-broadcast-line text-xl animate-pulse"></i>
             <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Sinyal Terjalin</span>
          </div>
          <h1 className="text-4xl font-display italic text-white">RUANG PERSIAPAN</h1>
          <p className="text-zinc-500 text-sm">Menunggu semua survivor untuk verifikasi node.</p>
        </div>

        <div className="flex items-center gap-4 relative">
          <AnimatePresence>
            {copied && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute -top-10 right-0 bg-neon-cyan text-black text-[10px] font-bold px-3 py-1 rounded shadow-[0_0_15px_rgba(0,243,255,0.4)] whitespace-nowrap"
              >
                BERHASIL DISALIN!
              </motion.div>
            )}
          </AnimatePresence>
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Sinyal Node</span>
            <p className="text-2xl text-white font-mono font-bold tracking-tighter">{room?.code || '...'}</p>
          </div>
          <button 
            onClick={handleCopyCode}
            className="p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white border border-zinc-800"
          >
            <i className={copied ? "ri-check-line text-emerald-400" : "ri-file-copy-line"}></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest font-mono text-zinc-500">Survivor Terhubung ({players.length}/4)</h3>
            <div className="h-1 flex-1 mx-4 bg-zinc-800/50" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {players.map((player) => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  isHost={player.id === room?.hostId} 
                  className="animate-in fade-in slide-in-from-bottom-5 duration-700"
                />
              ))}
              {players.length < 4 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-zinc-800 justify-center h-[76px]"
                >
                  <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                  <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-mono">
                    Inisialisasi Otomatis: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6 space-y-6" glow>
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tujuan Misi</h3>
               <ul className="space-y-3">
                 <li className="flex gap-3 text-xs text-zinc-400">
                   <i className="ri-checkbox-circle-line text-neon-cyan"></i>
                   <span>Menyusup ke sektor bawah</span>
                 </li>
                 <li className="flex gap-3 text-xs text-zinc-400">
                   <i className="ri-checkbox-blank-circle-line"></i>
                   <span>Temukan Data Blackbox Alpha</span>
                 </li>
                 <li className="flex gap-3 text-xs text-zinc-400">
                   <i className="ri-checkbox-blank-circle-line"></i>
                   <span>Ekstraksi dari Hangar 7</span>
                 </li>
               </ul>
            </div>

            <div className="pt-6 border-t border-zinc-800 space-y-4">
               <button 
                  onClick={toggleReady}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                    isReady ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
               >
                 {isReady ? 'Survivor Siap' : 'Tandai Siap'}
               </button>
               
               {room?.hostId === userId ? (
                 <button 
                  onClick={handleStart}
                  disabled={!isReady}
                  className="w-full py-4 bg-neon-cyan text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:grayscale disabled:hover:bg-neon-cyan"
                 >
                   Mulai Operasi
                 </button>
               ) : (
                 <div className="py-4 text-center border border-zinc-800 rounded-xl bg-zinc-900/50">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest animate-pulse">Menunggu Room Master...</span>
                 </div>
               )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
