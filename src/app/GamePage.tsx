import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatBar } from '../components/ui/StatBar';
import { ChoiceButton } from '../components/ui/ChoiceButton';
import { NarrationFeed } from '../components/game/NarrationFeed';
import { PlayerCard } from '../components/game/PlayerCard';
import { cn } from '../lib/utils';
import { Choice, GameTheme, Narration, Player } from '../types';
import { generateNextRound } from '../services/geminiService';
import { getRoom, getPlayers, getNarrations, updateRoomGameState, addNarration, initializeGame } from '../services/roomService';

export default function GamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const userId = searchParams.get('userId');
  const theme = (searchParams.get('theme') as GameTheme) || 'bunker';
  const username = searchParams.get('username') || 'Survivor';

  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [narrations, setNarrations] = useState<Narration[]>([]);
  const [timer, setTimer] = useState(30);
  const [round, setRound] = useState(1);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const initialContent = useMemo(() => {
    const data: Record<GameTheme, { narrations: Narration[], choices: Choice[] }> = {
      bunker: {
        narrations: [
          { id: 'b1', text: 'Pintu baja berat dari bunker berdesis saat menutup rapat. Kamu terjebak di dalam bunker bawah tanah. Kadar oksigen saat ini stabil.', timestamp: '12:00 PM', type: 'ai' },
          { id: 'b2', text: 'Inisialisasi Sistem... Narator AI "XENON" sekarang aktif.', timestamp: '12:01 PM', type: 'system' }
        ],
        choices: [
          { id: 'c1', text: 'Selidiki suara garukan di ventilasi.', risk: 'high' },
          { id: 'c2', text: 'Barikade lubang ventilasi.', risk: 'medium' },
          { id: 'c3', text: 'Periksa inventaris darurat.', risk: 'low' }
        ]
      },
      zombie: {
        narrations: [
          { id: 'z1', text: 'Sirine kota meraung untuk terakhir kalinya. Di kejauhan, kerumunan mayat hidup mulai mendobrak gerbang pusat perbelanjaan tempatmu berlindung.', timestamp: '10:00 PM', type: 'ai' },
          { id: 'z2', text: 'Deteksi Ancaman Biologis... Narator AI "XENON" memantau tanda vitalmu.', timestamp: '10:01 PM', type: 'system' }
        ],
        choices: [
          { id: 'c1', text: 'Lari ke atap untuk mencari helikopter.', risk: 'high' },
          { id: 'c2', text: 'Cari senjata di toko perlengkapan olahraga.', risk: 'medium' },
          { id: 'c3', text: 'Sembunyi di ruang pendingin makanan.', risk: 'low' }
        ]
      },
      virus_mlw: {
        narrations: [
          { id: 'v1', text: 'Error 404: Reality Not Found. Virus MLW telah menginfeksi inti simulasi. Tembok-tembok di sekitarmu mulai berubah menjadi barisan pixel merah.', timestamp: '00:00 AM', type: 'ai' },
          { id: 'v2', text: 'Integritas Kernel: 42%... Narator AI "XENON" mencoba memulihkan sektor aman.', timestamp: '00:01 AM', type: 'system' }
        ],
        choices: [
          { id: 'c1', text: 'Coba lakukan "Hard Reset" pada terminal terdekat.', risk: 'high' },
          { id: 'c2', text: 'Lari ke "Firewall" sebelum sektor ini terhapus.', risk: 'medium' },
          { id: 'c3', text: 'Kumpulkan "Data Shards" untuk memperkuat diri.', risk: 'low' }
        ]
      }
    };
    return data[theme];
  }, [theme]);

  // Firebase Subscriptions
  useEffect(() => {
    if (!roomId || !userId) {
      navigate('/setup');
      return;
    }

    const unsubRoom = getRoom(roomId, (roomData) => {
      setRoom(roomData);
      setTimer(roomData.timer);
      setRound(roomData.currentRound);
      setIsProcessing(roomData.isProcessing);
      if (roomData.currentChoices) {
        setChoices(roomData.currentChoices);
      } else if (roomData.hostId === userId) {
        initializeGame(roomId, initialContent);
      }
    });

    const unsubPlayers = getPlayers(roomId, (p) => setPlayers(p));
    const unsubNarrations = getNarrations(roomId, (n) => setNarrations(n));

    return () => {
      unsubRoom();
      unsubPlayers();
      unsubNarrations();
    };
  }, [roomId, userId, navigate, initialContent]);

  const isHost = room?.hostId === userId;

  // Global Timer (Host handles)
  useEffect(() => {
    if (isHost && roomId && timer > 0 && !isProcessing) {
      const t = setInterval(() => {
        updateRoomGameState(roomId, { timer: timer - 1 });
      }, 1000);
      return () => clearInterval(t);
    } else if (isHost && roomId && timer === 0 && !isProcessing && choices.length > 0) {
      handleChoiceExecution(choices[0].id);
    }
  }, [timer, isProcessing, choices, isHost, roomId]);

  const processingRef = useRef(false);

  const handleChoiceExecution = async (choiceId: string, currentChoicesOverride?: Choice[]) => {
    if (!roomId || processingRef.current) return;
    
    processingRef.current = true;
    // Set processing globally so others see the loading state
    await updateRoomGameState(roomId, { isProcessing: true, selectedChoiceId: choiceId });
    
    const activeChoices = currentChoicesOverride || choices;
    
    try {
      if (isHost) {
        const result = await generateNextRound(narrations, choiceId, activeChoices, theme);
        
        await addNarration(roomId, {
          text: result.narration,
          type: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          author: 'XENON'
        });

        await updateRoomGameState(roomId, {
          currentChoices: result.nextChoices,
          currentRound: round + 1,
          timer: 30,
          isProcessing: false,
          selectedChoiceId: null // Clear selection
        });

        if (round >= 5) {
          await updateRoomGameState(roomId, { status: 'ended' });
        }
      }
    } catch (error) {
      console.error("Game Loop Error:", error);
      if (isHost) {
        await updateRoomGameState(roomId, { isProcessing: false, selectedChoiceId: null });
      }
    } finally {
      processingRef.current = false;
    }
  };

  // Host listener for selections from other players
  useEffect(() => {
    if (isHost && room?.selectedChoiceId && !processingRef.current) {
      handleChoiceExecution(room.selectedChoiceId);
    }
  }, [isHost, room?.selectedChoiceId]);

  useEffect(() => {
    if (room?.status === 'ended') {
      setTimeout(() => navigate(`/end?theme=${theme}&username=${encodeURIComponent(username)}`), 3000);
    }
  }, [room?.status, theme, username, navigate]);

  const me = players.find(p => p.id === userId) || players[0];
  if (!me) return null;

  return (
    <div className="flex-1 flex flex-col h-[100dvh] lg:h-screen lg:max-h-screen lg:overflow-hidden lg:flex-row bg-black">
      {/* Left Panel: Narration Feed */}
      <div className="flex-[2] flex flex-col p-4 sm:p-6 h-[45vh] sm:h-[50vh] lg:h-full min-h-0 border-b lg:border-b-0 lg:border-r border-zinc-900 overflow-hidden shrink-0">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
           <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 h-10 rounded-full border border-neon-cyan/50 flex items-center justify-center bg-neon-cyan/5 shrink-0">
                 <i className="ri-radar-line text-neon-cyan text-sm sm:text-base animate-spin-slow"></i>
              </div>
              <div className="overflow-hidden">
                <h2 className="text-sm sm:text-lg font-display italic text-white uppercase tracking-tight truncate">Operasi XJ-901</h2>
                <div className="flex items-center gap-2 text-[7px] sm:text-[10px] text-zinc-500 font-mono font-medium">
                  <span className="text-neon-cyan animate-pulse">LIVE</span>
                  <span>RONDE {round}</span>
                </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4 sm:gap-8 shrink-0">
             <div className="text-right">
                <span className="text-[7px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Pulse</span>
                <p className={cn(
                  "text-lg sm:text-2xl font-mono font-bold tabular-nums",
                  timer < 10 ? "text-danger animate-pulse" : "text-white"
                )}>
                  00:{timer < 10 ? `0${timer}` : timer}
                </p>
             </div>
           </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <NarrationFeed narrations={narrations} />
        </div>
        
        {/* Current Round Context */}
        <div className="relative mt-2 sm:mt-4">
          <AnimatePresence mode="wait">
            {!isProcessing ? (
              <motion.div
                key="choices"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 max-h-[150px] overflow-y-auto no-scrollbar"
              >
                {choices.map((choice) => (
                  <ChoiceButton 
                    key={choice.id}
                    text={choice.text}
                    risk={choice.risk}
                    onClick={() => handleChoiceExecution(choice.id)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3 sm:gap-4 py-4 sm:py-8 glass rounded-2xl border-neon-cyan/20"
              >
                 <div className="flex gap-1 shrink-0">
                   {[0, 1, 2].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-neon-cyan rounded-full"
                      />
                   ))}
                 </div>
                 <span className="text-[7px] sm:text-[9px] uppercase font-mono tracking-[0.2em] sm:tracking-[0.4em] text-neon-cyan text-glow-cyan text-center px-4 leading-relaxed">
                   AI sedang memperhitungkan konsekuensi...
                 </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel: Stats & Players */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 sm:space-y-6 bg-zinc-950/50 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-zinc-900 overflow-y-auto lg:overflow-visible">
        {/* Self Stats */}
        <div className="space-y-4 sm:space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-[9px] sm:text-[10px] uppercase tracking-widest font-mono text-zinc-500">Status Biometrik</h3>
              <i className="ri-pulse-line text-neon-cyan text-xs"></i>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 px-1 font-bold">
             <StatBar label="Integritas Biologis" value={me.hp} icon="ri-heart-pulse-line" color="danger" />
             <StatBar label="Cadangan Nutrisi" value={me.hunger} icon="ri-cup-line" color="warning" />
             <StatBar label="Stabilitas Neural" value={me.sanity} icon="ri-brain-line" color="cyan" />
             <StatBar label="Konektivitas Grup" value={me.trust} icon="ri-user-heart-line" />
           </div>
        </div>

        {/* Inventory */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[9px] sm:text-[10px] uppercase tracking-widest font-mono text-zinc-500">Inventaris</h3>
            <span className="text-[8px] sm:text-[9px] text-zinc-600 font-mono">3 / 10 SLOT</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <InventoryItem icon="ri-flashlight-line" count={1} />
            <InventoryItem icon="ri-syringe-line" count={2} isRare />
            <InventoryItem icon="ri-shield-keyhole-line" count={1} />
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-zinc-900 bg-zinc-900/20 flex items-center justify-center">
              <i className="ri-add-line text-zinc-800"></i>
            </div>
          </div>
        </div>

        {/* Other Players */}
        <div className="flex-1 min-h-[150px] space-y-4 overflow-y-auto no-scrollbar pt-4 border-t border-zinc-900">
           <h3 className="text-[9px] sm:text-[10px] uppercase tracking-widest font-mono text-zinc-500">Anggota Survivor</h3>
           <div className="space-y-2">
              {players.map(p => (
                <PlayerCard key={p.id} player={p} className="p-2 border-0 bg-transparent hover:bg-zinc-900/40" />
              ))}
           </div>
        </div>
        
        {/* Action Input */}
        <div className="pt-4 mt-auto">
           <form 
             onSubmit={(e) => {
               e.preventDefault();
               const input = e.currentTarget.querySelector('input');
               if (input && input.value.trim() && !isProcessing) {
                 const customChoice = { id: 'custom', text: input.value, risk: 'medium' as const };
                 handleChoiceExecution('custom', [customChoice, ...choices]);
                 input.value = '';
               }
             }}
             className="relative"
           >
              <input 
                placeholder="Sarankan tindakan kreatif..." 
                className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl py-3 pl-4 pr-12 text-sm text-zinc-300 placeholder:text-zinc-700 font-mono focus:outline-none focus:border-neon-cyan/50 transition-all" 
              />
              <button 
                type="submit"
                disabled={isProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-neon-cyan transition-colors disabled:opacity-50"
              >
                <i className="ri-send-plane-2-line"></i>
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}

function InventoryItem({ icon, count, isRare }: { icon: string, count: number, isRare?: boolean }) {
  return (
    <div className={cn(
      "relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg border flex items-center justify-center transition-all cursor-help hover:scale-105 active:scale-95 group",
      isRare ? "border-neon-cyan/40 bg-neon-cyan/5" : "border-zinc-800 bg-zinc-900/40"
    )}>
      <i className={cn("text-lg sm:text-xl", icon, isRare ? "text-neon-cyan" : "text-zinc-500 group-hover:text-zinc-300")}></i>
      <span className="absolute bottom-1 right-1 text-[7px] sm:text-[9px] font-mono text-zinc-600 bg-black/50 px-1 rounded">x{count}</span>
      {isRare && <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-neon-cyan animate-pulse" />}
    </div>
  );
}
