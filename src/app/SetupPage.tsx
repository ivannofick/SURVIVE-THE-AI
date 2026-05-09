import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { GlassCard } from '../components/ui/GlassCard';
import { GameTheme } from '../types';
import { cn } from '../lib/utils';

export default function SetupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isJoin = searchParams.get('join') === 'true';
  
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [theme, setTheme] = useState<GameTheme>('bunker');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username) {
      navigate(`/lobby?theme=${theme}&username=${encodeURIComponent(username)}`);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <GlassCard className="p-10 space-y-8" glow>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display italic text-white">
              {isJoin ? 'SINKRON NODE' : 'ESTABLISH NODE'}
            </h2>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">
              Akses resmi diperlukan untuk ekstraksi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="absolute top-4 left-4 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono ml-1">
                  Identitas Survivor
                </label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan nama pengguna..." 
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/20 transition-all font-mono"
                  required
                />
              </div>

              {!isJoin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono ml-1">
                    Masuk Ke Zona
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'bunker', label: 'Underground Bunker', icon: 'ri-building-line' },
                      { id: 'zombie', label: 'Zombie Apocalypse', icon: 'ri-skull-2-line' },
                      { id: 'virus_mlw', label: 'Digital Virus (MLW)', icon: 'ri-bug-line' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id as GameTheme)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-mono",
                          theme === t.id 
                            ? "bg-neon-cyan/10 border-neon-cyan text-neon-cyan" 
                            : "bg-black/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        )}
                      >
                        <i className={t.icon}></i>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isJoin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono ml-1">
                    Kode Sinyal Node
                  </label>
                  <input 
                    type="text" 
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="misal: XJ-901" 
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/20 transition-all font-mono uppercase"
                    required={isJoin}
                  />
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-zinc-100 text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-neon-cyan transition-all shadow-lg active:scale-[0.98]"
            >
              Inisialisasi Sinkronisasi
            </button>

            <button 
              type="button"
              onClick={() => navigate(isJoin ? '/setup' : '/setup?join=true')}
              className="w-full py-2 text-zinc-500 text-[10px] uppercase tracking-widest hover:text-zinc-300 transition-colors"
            >
              {isJoin ? "Gunakan node baru saja" : "Saya sudah punya kode sinyal"}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
