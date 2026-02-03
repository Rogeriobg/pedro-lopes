import React from "react";
import { PEDRO_LOPES_HERO_IMAGE } from "@/constants";

const Hero: React.FC = () => {
  return (
    <header
      id="home"
      className="relative h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#1a0505]"
    >
      {/* Camadas de Gradiente para efeito cinematográfico e leitura de texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2D0B0B] via-transparent to-black/70 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#2D0B0B] via-transparent to-transparent z-10"></div>

      {/* Foto Principal do Cantor (Carregada localmente da pasta /assets) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={PEDRO_LOPES_HERO_IMAGE}
          className="w-full h-full object-cover object-[center_20%] opacity-80 lg:opacity-90 transform scale-100 lg:scale-105 transition-transform duration-[10s] ease-out animate-slow-zoom"
          alt="Pedro Lopes Oficial"
          style={{
            filter: "contrast(1.1) brightness(0.9)",
          }}
        />
      </div>

      <div className="relative z-20 text-center lg:text-left lg:absolute lg:left-24 px-6 max-w-5xl">
        <div className="mb-6 inline-block">
          <span className="bg-red-700 text-white px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl animate-pulse">
            O Fenômeno do Sertanejo
          </span>
        </div>

        <h1 className="text-6xl md:text-9xl font-serif font-black mb-4 tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] text-white">
          PEDRO <span className="text-red-600 block lg:inline">LOPES</span>
        </h1>

        <p className="text-lg md:text-3xl text-white font-medium mb-10 max-w-2xl uppercase tracking-[0.15em] drop-shadow-lg">
          A nova voz que está{" "}
          <span className="text-red-600 font-black italic">conquistando</span> o
          Brasil
        </p>

        <div className="flex flex-col sm:flex-row gap-5">
          <a
            href="#schedule"
            className="bg-red-700 hover:bg-red-600 text-white px-12 py-5 rounded-2xl font-black transition-all transform hover:scale-105 shadow-[0_20px_40px_rgba(185,28,28,0.4)] uppercase text-xs tracking-widest text-center"
          >
            Agenda de Shows
          </a>
          <a
            href="#music"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-12 py-5 rounded-2xl font-black transition-all uppercase text-xs tracking-widest text-center"
          >
            Ouvir Músicas
          </a>
        </div>
      </div>

      {/* Detalhe decorativo vertical de design */}
      <div className="absolute bottom-12 left-12 z-20 hidden lg:block">
        <div className="flex flex-col gap-2">
          <div className="h-[2px] w-24 bg-red-600"></div>
          <div className="h-[2px] w-16 bg-white/30"></div>
          <div className="h-[2px] w-8 bg-white/10"></div>
        </div>
      </div>

      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1.0); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </header>
  );
};

export default Hero;
