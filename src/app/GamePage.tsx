import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatBar } from '../components/ui/StatBar';
import { ChoiceButton } from '../components/ui/ChoiceButton';
import { NarrationFeed } from '../components/game/NarrationFeed';
import { PlayerCard } from '../components/game/PlayerCard';
import { MOCK_PLAYERS } from '../mock-data';
import { cn } from '../lib/utils';
import { Choice, GameTheme, Narration } from '../types';

import { generateNextRound } from '../services/geminiService';

export default function GamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = (searchParams.get('theme') as GameTheme) || 'bunker';
  const username = searchParams.get('username') || 'Survivor';

  const players = useMemo(() => {
    return [{
      id: '1',
      username: username,
      hp: 100,
      hunger: 100,
      sanity: 100,
      trust: 100,
      isReady: true,
      isAlive: true,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`
    }];
  }, [username]);

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

  const [narrations, setNarrations] = useState<Narration[]>(initialContent.narrations);
  const [choices, setChoices] = useState<Choice[]>(initialContent.choices);
  const [timer, setTimer] = useState(30);
  const [round, setRound] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Round timer
  useEffect(() => {
    if (timer > 0 && !isProcessing) {
      const t = setInterval(() => setTimer(v => v - 1), 1000);
      return () => clearInterval(t);
    } else if (timer === 0 && !isProcessing) {
      handleChoiceExecution(choices[0].id); // Auto-pick first choice on timeout
    }
  }, [timer, isProcessing, choices]);

  const handleChoiceExecution = async (choiceId: string, currentChoices?: Choice[]) => {
    setIsProcessing(true);
    const activeChoices = currentChoices || choices;
    
    try {
      const result = await generateNextRound(narrations, choiceId, activeChoices, theme);
      
      const newNarration = {
        id: Date.now().toString(),
        text: result.narration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'ai' as const,
      };
      
      setNarrations(prev => [...prev, newNarration]);
      setChoices(result.nextChoices);
      setRound(v => v + 1);
      setTimer(30);
      
      if (round >= 5) { // Game slightly longer
        setTimeout(() => navigate(`/end?theme=${theme}`), 3000);
      }
    } catch (error) {
      console.error("Game Loop Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden lg:flex-row">
      {/* Left Panel: Narration Feed */}
      <div className="flex-[2] flex flex-col p-4 sm:p-6 min-h-0 border-b lg:border-b-0 lg:border-r border-zinc-900">
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

        <div className="flex-1 flex flex-col overflow-hidden">
          <NarrationFeed narrations={narrations} />
        </div>
        
        {/* Current Round Context */}
        <AnimatePresence>
          {!isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4"
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
          )}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex items-center justify-center gap-4 py-8 glass rounded-2xl border-neon-cyan/20"
            >
               <div className="flex gap-1">
                 {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-neon-cyan rounded-full"
                    />
                 ))}
               </div>
               <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-neon-cyan text-glow-cyan">
                 XENON sedang memperhitungkan konsekuensi...
               </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Panel: Stats & Players */}
      <div className="flex-1 lg:flex-none lg:w-96 flex flex-col p-4 sm:p-6 space-y-6 sm:space-y-8 bg-zinc-950/50 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-zinc-900">
        {/* Self Stats */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Status Biometrik</h3>
              <i className="ri-pulse-line text-neon-cyan text-xs"></i>
           </div>
           
           <div className="space-y-5 px-1 font-bold">
             <StatBar label="Integritas Biologis" value={players[0].hp} icon="ri-heart-pulse-line" color="danger" />
             <StatBar label="Cadangan Nutrisi" value={players[0].hunger} icon="ri-cup-line" color="warning" />
             <StatBar label="Stabilitas Neural" value={players[0].sanity} icon="ri-brain-line" color="cyan" />
             <StatBar label="Konektivitas Grup" value={players[0].trust} icon="ri-user-heart-line" />
           </div>
        </div>

        {/* Inventory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Inventaris</h3>
            <span className="text-[9px] text-zinc-600 font-mono">3 / 10 SLOT</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <InventoryItem icon="ri-flashlight-line" count={1} />
            <InventoryItem icon="ri-syringe-line" count={2} isRare />
            <InventoryItem icon="ri-shield-keyhole-line" count={1} />
            <div className="aspect-square rounded-lg border border-zinc-900 bg-zinc-900/20 flex items-center justify-center">
              <i className="ri-add-line text-zinc-800"></i>
            </div>
          </div>
        </div>

        {/* Other Players */}
        <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pt-4 border-t border-zinc-900">
           <h3 className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Anggota {username}</h3>
           <div className="space-y-3">
              {players.map(p => (
                <PlayerCard key={p.id} player={p} className="p-2 border-0 bg-transparent hover:bg-zinc-900/40" />
              ))}
           </div>
        </div>
        
        {/* Action Input */}
        <div className="pt-4">
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
      "relative aspect-square rounded-lg border flex items-center justify-center transition-all cursor-help hover:scale-105 active:scale-95 group",
      isRare ? "border-neon-cyan/40 bg-neon-cyan/5" : "border-zinc-800 bg-zinc-900/40"
    )}>
      <i className={cn("text-xl", icon, isRare ? "text-neon-cyan" : "text-zinc-500 group-hover:text-zinc-300")}></i>
      <span className="absolute bottom-1 right-1 text-[9px] font-mono text-zinc-600 bg-black/50 px-1 rounded">x{count}</span>
      {isRare && <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-neon-cyan animate-pulse" />}
    </div>
  );
}
