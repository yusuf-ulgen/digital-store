"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HeroPromo() {
  return (
    <section className="relative w-full overflow-hidden rounded-[2.5rem] bg-gray-900 text-white min-h-[450px] flex items-center shadow-2xl my-8">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[140%] bg-blue-600/20 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-30%] left-[-20%] w-[50%] h-[120%] bg-purple-600/10 blur-[110px] rounded-full animate-pulse delay-700" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px" 
          }} 
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-8 md:px-16 py-16 grid lg:grid-cols-2 items-center gap-12">
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="px-4 py-1.5 bg-blue-600/10 backdrop-blur-xl rounded-full border border-blue-500/20 flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">Geleneksel Sanat</span>
            </div>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-[1.05] mb-8 animate-in fade-in slide-in-from-left duration-1000">
            Mutfağın <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-purple-400">
              Yeni Standardı.
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-12 leading-relaxed max-w-md animate-in fade-in slide-in-from-left duration-1000 delay-200">
            20 yıllık ustalıkla dövülen, her kesişte hassasiyeti hissettiren orijinal Sürmene serisi.
          </p>

          <div className="flex flex-wrap gap-5 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
            <Link
              href="/products?cat=bicaklar"
              className="px-10 py-5 bg-white text-gray-900 font-bold rounded-2xl flex items-center gap-3 hover:bg-blue-50 transition-all shadow-2xl shadow-blue-500/10 active:scale-95"
            >
              Koleksiyonu Keşfet
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/products?cat=sef-bicagi"
              className="px-10 py-5 bg-white/5 backdrop-blur-md text-white font-bold rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all active:scale-95"
            >
              Şef Serisi
            </Link>
          </div>
        </div>

        {/* Hero Graphic Section */}
        <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000 delay-300">
          <div className="relative w-full aspect-square flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent rounded-full border border-white/5 rotate-12 scale-110" />
             <div className="absolute inset-0 bg-gradient-to-bl from-purple-600/5 to-transparent rounded-full border border-white/5 -rotate-12 scale-90" />
             
             {/* Visual representation of a knife or branding */}
             <div className="relative z-10 text-[180px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-[-45deg] animate-bounce duration-[3000ms]">
               🔪
             </div>
             
             {/* Dynamic Badge */}
             <div className="absolute bottom-10 right-0 bg-blue-600 text-white p-6 rounded-3xl shadow-2xl rotate-12 border-4 border-gray-900 scale-110">
                <div className="text-3xl font-black leading-none">%20</div>
                <div className="text-[10px] font-bold uppercase tracking-widest mt-1">İndirim</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
