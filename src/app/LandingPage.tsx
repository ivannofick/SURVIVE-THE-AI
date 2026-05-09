import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Hero Content */}
      <div className="max-w-4xl w-full text-center space-y-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-8xl font-display italic tracking-tighter text-white">
            SURVIVE <span className="text-neon-cyan text-shadow-glow">THE AI</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl font-light tracking-[0.2em] uppercase">
            Simulasi Survival Multiplayer Sinematik
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8"
        >
          <Link to="/setup" className="w-full md:w-auto">
            <button className="w-full md:w-64 px-8 py-4 bg-neon-cyan text-black font-bold text-sm uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,242,255,0.3)]">
              Mulai Koneksi
            </button>
          </Link>
          <Link to="/setup?join=true" className="w-full md:w-auto">
            <button className="w-full md:w-64 px-8 py-4 bg-transparent border border-zinc-700 text-white font-bold text-sm uppercase tracking-widest rounded-full hover:border-white transition-all transform hover:scale-105 active:scale-95">
              Sinkron ke Node
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-24">
        <FeatureCard 
          icon="ri-ai-generate"
          title="Narasi Dinamis"
          desc="AI kami XENON merangkai alur cerita survival unik untuk setiap sesi, bereaksi terhadap setiap pilihanmu."
        />
        <FeatureCard 
          icon="ri-team-line"
          title="Kepercayaan & Pengkhianatan"
          desc="Koordinasi dengan survivor lain, atau korbankan mereka untuk memastikan ekstraksimu sendiri dari bunker."
        />
        <FeatureCard 
          icon="ri-skull-line"
          title="Brutalitas Hardcore"
          desc="Satu kesalahan sudah cukup. Kelola HP, Sanity, dan sumber daya di dunia yang menginginkanmu mati."
        />
      </div>

      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Footer */}
      <footer className="mt-24 py-12 border-t border-zinc-900 w-full flex flex-col md:flex-row justify-between items-center gap-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-neon-cyan/30 flex items-center justify-center bg-neon-cyan/5">
            <i className="ri-radar-line text-neon-cyan text-[10px]"></i>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Operation XJ-901</span>
        </div>
        
        <div className="flex items-center gap-8 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          <Link to="/about" className="hover:text-white transition-colors">Tentang Kami</Link>
          <a href="#" className="hover:text-white transition-colors">Protokol</a>
          <a href="#" className="hover:text-white transition-colors">Log Sistem</a>
        </div>

        <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
          &copy; 2026 Simulation Development Unit
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <GlassCard className="p-8 group hover:border-neon-cyan/50 transition-colors">
      <i className={`${icon} text-3xl text-neon-cyan mb-4 block`}></i>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
    </GlassCard>
  );
}
