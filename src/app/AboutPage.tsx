import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6 space-y-12 py-16">
      <button 
        onClick={() => navigate('/')}
        className="mb-8 p-2 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 font-mono text-xs uppercase self-start"
      >
        <i className="ri-arrow-left-line"></i>
        Kembali ke Beranda
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-4xl font-display italic text-white uppercase tracking-tighter italic">
            Tentang <span className="text-neon-cyan">XJ-901</span>
          </h1>
          <div className="h-1 w-20 bg-neon-cyan" />
        </div>

        <div className="max-w-none space-y-6 font-sans text-zinc-400 leading-relaxed">
          <p className="text-lg">
            <span className="text-white font-bold">XJ-901</span> bukanlah sekadar game. Ia adalah sebuah manifestasi dari rasa penasaran manusia terhadap batas akhir dari ketahanan mental dan sosial. 
          </p>

          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
            <h2 className="text-white font-mono text-xs uppercase tracking-[0.3em]">Mengapa Simulasi Ini Ada?</h2>
            <p className="text-sm sm:text-base">
              Dunia kita semakin terfragmentasi. Teknologi yang seharusnya menghubungkan justru seringkali mengisolasi. Operasi XJ-901 dirancang untuk menguji satu elemen fundamental yang hilang: <span className="text-neon-cyan italic">Kepercayaan Murni dalam Tekanan Ekstrim.</span>
            </p>
            <p className="text-sm sm:text-base">
              Simulasi ini menempatkan Anda dalam skenario di mana pilihan Anda tidak hanya mempengaruhi statistik diri sendiri, tetapi juga keseimbangan integritas seluruh grup. Apakah Anda akan menjadi jangkar yang menstabilkan, atau anomali yang mempercepat kehancuran?
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-white font-display text-xl italic uppercase font-bold italic">Visi Pengembang</h2>
            <p className="text-sm sm:text-base">
              Saya menciptakan platform ini untuk mengeksplorasi narasi interaktif yang "dingin" secara visual namun "panas" secara emosional. Visual brutalist-cyberpunk dipilih untuk merepresentasikan kekosongan masa depan jika empati diabaikan.
            </p>
            <p className="text-sm sm:text-base">
              Setiap ronde, setiap pulse yang berdetak, dan setiap pilihan yang Anda ambil adalah bit data dalam eksperimen sosial berskala besar ini. Selamat berekstrikasi, atau selamat tertinggal di dalam kode.
            </p>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-900 flex flex-col items-center justify-center space-y-4">
          <div className="flex gap-6 text-2xl text-zinc-500">
            <a href="#" className="hover:text-neon-cyan transition-colors"><i className="ri-github-fill"></i></a>
            <a href="#" className="hover:text-neon-cyan transition-colors"><i className="ri-twitter-x-fill"></i></a>
            <a href="#" className="hover:text-neon-cyan transition-colors"><i className="ri-instagram-line"></i></a>
          </div>
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            Dikembangkan oleh MzK3tc1N9 &copy; 2026 - Unit Pengembangan Simulasi
          </p>
        </div>
      </motion.div>
    </div>
  );
}
