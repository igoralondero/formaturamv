
import React from 'react';
import LogoIcon from './LogoIcon';

const WelcomeHero: React.FC = () => {
  const scrollToRSVP = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('rsvp-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-navy-gradient">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-20 max-w-6xl w-full flex flex-col items-center justify-center space-y-6 md:space-y-10 animate-fadeIn">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="h-[1px] w-12 md:w-16 bg-gradient-to-r from-transparent to-blue-500/50"></div>
            <span className="text-blue-400 font-sans text-[10px] md:text-xs tracking-ultra uppercase font-bold">
              Psicologia 2026
            </span>
            <div className="h-[1px] w-12 md:w-16 bg-gradient-to-l from-transparent to-blue-500/50"></div>
          </div>
        </div>
        
        <div className="space-y-4 w-full">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-serif text-white tracking-tighter leading-[0.9] text-shadow-premium">
            Maria <span className="text-white block sm:inline italic font-medium">Valentina</span>
          </h1>
        </div>

        <div className="flex justify-center h-40 md:h-56 items-center">
           <LogoIcon className="w-48 h-32 md:w-80 md:h-56" />
        </div>

        <p className="text-xs md:text-base text-blue-100/40 font-sans font-light max-w-lg mx-auto leading-relaxed italic px-4">
          "Conheça todas as teorias, domine todas as técnicas, mas ao tocar uma alma humana, seja apenas outra alma humana"
        </p>

        <div className="pt-2">
          <button 
            onClick={scrollToRSVP}
            className="group bg-blue-accent text-white px-12 md:px-16 py-4 md:py-5 rounded-full font-sans font-bold uppercase tracking-luxury text-[10px] md:text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl border border-blue-400/20 relative overflow-hidden"
          >
            <span className="relative z-10">Confirmar Presença</span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default WelcomeHero;