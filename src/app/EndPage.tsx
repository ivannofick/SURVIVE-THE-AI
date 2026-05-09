import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GameTheme } from '../types';

export default function EndPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = (searchParams.get('theme') as GameTheme) || 'bunker';

  const themeNarrations: Record<GameTheme, string> = {
    bunker: "Kamu berhasil melarikan diri dari bunker, namun data yang kamu pulihkan terfragmentasi. AI 'XENON' tetap tertidur... untuk saat ini. Kelangsungan hidupmu adalah anomali statistik, sebuah gangguan dalam simulasi kepunahan.",
    zombie: "Lampu helikopter menyinari atap saat kamu melompat ke atas. Kota di bawah telah sepenuhnya tenggelam dalam lautan mayat hidup. Kamu selamat, tapi dunia yang kamu kenal telah berakhir.",
    virus_mlw: "Kernel sistem akhirnya stabil. Virus MLW berhasil dikarantina ke sub-sektor yang terisolasi. Kamu terbangun di dunia nyata, tapi ada barisan kode yang masih berkedip di sudut matamu... Kamu adalah bagian dari simulasi sekarang."
  };

  const username = searchParams.get('username') || 'Survivor';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12 py-24 relative">
      <button 
        onClick={() => navigate('/')}
        className="mb-8 p-2 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 font-mono text-xs uppercase z-50 self-start"
      >
        <i className="ri-arrow-left-line"></i>
        Kembali ke Beranda
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-24 h-24 rounded-full border-2 border-neon-cyan flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(0,242,255,0.2)]">
           <i className="ri-award-line text-5xl text-neon-cyan"></i>
        </div>
        <h1 className="text-6xl font-display italic text-white">PERHITUNGAN SELESAI</h1>
        <p className="text-zinc-500 uppercase tracking-[0.4em] font-mono text-xs">Status ekstraksi: BERHASIL SEBAGIAN</p>
      </motion.div>

      <GlassCard className="max-w-4xl w-full p-10 space-y-10" glow>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Narasi Akhir</h3>
            <p className="text-zinc-300 leading-relaxed italic border-l border-neon-cyan/30 pl-4 py-2">
              "{themeNarrations[theme]}"
            </p>
          </div>

          <div className="space-y-6 text-sm">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Ringkasan Survivor</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-emerald-400">
                <span>{username}</span>
                <span className="font-mono">TEREKSTRAKSI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-zinc-800 flex flex-col md:flex-row gap-6 justify-center">
          <button 
            onClick={() => navigate('/')}
            className="px-12 py-4 bg-neon-cyan text-black font-bold text-xs uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,242,255,0.2)]"
          >
            Inisialisasi Ulang Simulasi
          </button>
          <button 
            className="px-12 py-4 bg-transparent border border-zinc-700 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:border-white transition-all transform hover:scale-105 active:scale-95"
          >
            Unduh Log Data
          </button>
        </div>
      </GlassCard>

      <div className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest opacity-50">
        // End of Session ID: SIGMA-BETA-770
      </div>
    </div>
  );
}
