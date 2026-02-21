
import React, { useState, useEffect } from 'react';
import { RSVPData } from '../types';
import { LogOut } from 'lucide-react';
import LogoIcon from './LogoIcon';

interface MainSiteProps {
  userData: RSVPData;
  onEdit: () => void;
  onLogout: () => void;
}

const MainSite: React.FC<MainSiteProps> = ({ userData, onEdit, onLogout }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [activeSection, setActiveSection] = useState('home');
  const [photos, setPhotos] = useState<{url: string, legenda: string}[]>([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const eventDate = new Date('2026-03-21T20:30:00');

  const carouselImages = [
    "https://lh3.googleusercontent.com/d/1KkUAKbIFMSLTkAyy_qToyUnx-vqiBx-j",
    "https://lh3.googleusercontent.com/d/1Ih-vra04izevSyEHZLVeroPbGsAX68E0",
    "https://lh3.googleusercontent.com/d/161PwwS_bPabVIt6ZSLpkyUa79qro1e1j"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        if (response.ok) {
          const data = await response.json();
          setPhotos(data);
        }
      } catch (err) {
        console.error("Erro ao buscar fotos:", err);
      }
    };
    fetchPhotos();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate.getTime() - now;
      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && ['home', 'cerimonia', 'localizacao', 'trajetoria', 'minha-presenca'].includes(entry.target.id)) {
          setActiveSection(entry.target.id);
        }
        
        if (entry.isIntersecting && entry.target.classList.contains('reveal')) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    ['home', 'cerimonia', 'localizacao', 'trajetoria', 'minha-presenca'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { id: 'minha-presenca', label: 'Minha Presença' },
    { id: 'cerimonia', label: 'Evento' },
    { id: 'localizacao', label: 'Local' },
  ];

  return (
    <div className="bg-[#000814] text-white font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#000814]/95 backdrop-blur-2xl border-b border-blue-900/20 py-4 px-6 md:px-12 flex flex-col transition-all duration-500">
        <div className="flex justify-between items-center w-full">
          <a 
            href="#home" 
            onClick={scrollToSection('home')}
            className="font-serif text-lg tracking-widest flex items-center gap-3 group"
          >
            <LogoIcon className="w-16 h-10 group-hover:scale-110 transition-transform" />
          </a>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex text-[9px] font-sans font-bold text-white bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 uppercase tracking-widest">
              Olá, {userData.fullName.split(' ')[0]}
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-blue-400 hover:text-white hover:bg-blue-500/10 rounded-full transition-all"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex justify-center gap-6 md:gap-10 text-[9px] font-sans font-bold uppercase tracking-luxury overflow-x-auto no-scrollbar py-2 mt-2">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={scrollToSection(item.id)}
              className={`relative py-2 whitespace-nowrap transition-all duration-300 ${
                activeSection === item.id ? 'text-blue-400' : 'text-blue-300/40 hover:text-blue-400'
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-blue-400"></span>
              )}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden scroll-mt-24">
        <div className="absolute inset-0 bg-navy-gradient opacity-80"></div>
        
        <div className="relative z-10 max-w-6xl w-full flex flex-col items-center space-y-8 md:space-y-12">
          <div className="space-y-8 reveal">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-serif text-white tracking-tighter leading-[0.9] text-shadow-premium">
              Sua presença <span className="text-white block sm:inline italic font-medium">está confirmada!</span>
            </h1>
            <h2 className="text-blue-400 font-sans font-bold tracking-ultra text-[10px] uppercase mt-8">Contagem Regressiva</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 w-full px-4">
            {[
              { label: 'Dias', val: timeLeft.days },
              { label: 'Horas', val: timeLeft.hours },
              { label: 'Mins', val: timeLeft.mins },
              { label: 'Segs', val: timeLeft.secs }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="bg-blue-950/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-blue-500/10 shadow-xl flex flex-col items-center justify-center aspect-square group hover:border-blue-500/30 transition-all duration-700 reveal"
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <span className="block text-5xl md:text-7xl font-serif text-white group-hover:text-blue-400 transition-colors leading-none">{item.val.toString().padStart(2, '0')}</span>
                <span className="text-[9px] font-sans uppercase tracking-ultra text-blue-300/20 font-bold mt-6 block">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minha Presença Section */}
      <section id="minha-presenca" className="py-32 px-6 scroll-mt-24 relative overflow-hidden bg-[#00040a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4 reveal">
            <span className="text-blue-500 font-sans font-bold text-[10px] tracking-ultra uppercase">Seu Cartão VIP</span>
            <h2 className="text-4xl md:text-6xl font-serif">Minha Presença</h2>
          </div>

          <div className="reveal bg-[#001d3d]/30 backdrop-blur-3xl rounded-[3rem] border border-blue-500/20 overflow-hidden shadow-2xl">
            <div className="p-8 md:p-16 space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                  <h3 className="text-3xl font-serif text-white">{userData.fullName}</h3>
                  <p className="text-blue-400 font-sans text-[10px] uppercase tracking-luxury font-bold mt-2">Status: Confirmado(a)</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={onEdit}
                    className="bg-blue-accent text-white px-8 py-3 rounded-xl font-sans font-bold uppercase tracking-luxury text-[9px] hover:scale-105 transition-all shadow-lg"
                  >
                    EDITAR DADOS
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <p className="text-blue-400/50 font-sans text-[9px] uppercase tracking-ultra font-bold">Resumo de Convidados</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-950/40 p-6 rounded-2xl border border-blue-500/5">
                      <span className="block text-3xl font-serif text-white">{userData.adultsCount + 1}</span>
                      <span className="text-[8px] font-sans uppercase tracking-widest text-blue-300/20">Adultos</span>
                    </div>
                    <div className="bg-blue-950/40 p-6 rounded-2xl border border-blue-500/5">
                      <span className="block text-3xl font-serif text-white">{userData.childrenCount}</span>
                      <span className="text-[8px] font-sans uppercase tracking-widest text-blue-300/20">Crianças</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-blue-400/50 font-sans text-[9px] uppercase tracking-ultra font-bold">Acompanhantes</p>
                  <div className="space-y-3">
                    {userData.companions.length > 0 ? (
                      userData.companions.map((comp, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                          <div className="w-2 h-2 rounded-full bg-blue-500/30"></div>
                          <div className="flex-1">
                            <p className="text-sm font-sans font-medium text-white">{comp.name}</p>
                            <p className="text-[8px] font-sans uppercase tracking-widest text-blue-400/40">{comp.type}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-blue-100/20 italic">Você não adicionou acompanhantes.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500/5 p-8 text-center border-t border-blue-500/10">
              <p className="text-blue-200/40 font-sans text-[9px] uppercase tracking-widest leading-relaxed">
                Precisa alterar algo? <button onClick={onEdit} className="text-blue-400 font-bold hover:underline ml-2">Clique aqui para editar sua presença.</button>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section id="cerimonia" className="py-32 px-6 max-w-7xl mx-auto overflow-hidden scroll-mt-24">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="reveal w-full">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-8 bg-blue-950/20 rounded-[2.5rem] border border-blue-500/10 space-y-4 hover:border-blue-500/20 transition-all reveal" style={{ transitionDelay: '200ms' }}>
                <LogoIcon className="w-24 h-16" />
                <div>
                  <p className="font-serif text-2xl">21 de Março</p>
                  <p className="text-blue-400/40 font-sans uppercase tracking-luxury text-[9px] font-bold mt-2">Sábado • 20:30h</p>
                </div>
              </div>
              <div className="p-8 bg-blue-950/20 rounded-[2.5rem] border border-blue-500/10 space-y-4 hover:border-blue-500/20 transition-all reveal" style={{ transitionDelay: '400ms' }}>
                <div className="text-blue-400 font-sans font-bold tracking-luxury text-[9px] uppercase opacity-40">Onde será</div>
                <div>
                  <p className="font-serif text-2xl">Clube Comercial Catuípe</p>
                  <p className="text-blue-400/40 font-sans uppercase tracking-luxury text-[9px] font-bold mt-2">Catuípe • RS</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group reveal" style={{ transitionDelay: '300ms' }}>
            <div className="absolute -inset-8 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-all duration-1000"></div>
            <div className="relative rounded-[3rem] overflow-hidden border border-blue-500/10 shadow-2xl aspect-[4/5] bg-[#001d3d]">
              {carouselImages.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`Maria Valentina ${idx + 1}`} 
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                    idx === currentCarouselIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#000814] via-transparent to-transparent z-10"></div>
              <div className="absolute bottom-12 left-10 right-10 z-20">
                 <h3 className="text-4xl font-serif text-white tracking-wide">Maria Valentina</h3>
                 <p className="text-blue-400 font-sans uppercase tracking-ultra text-[10px] font-bold mt-3">Bacharel em Psicologia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="localizacao" className="py-32 bg-[#00040a] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="text-center mb-16 space-y-4 reveal">
            <span className="text-blue-500 font-sans font-bold text-[10px] tracking-ultra uppercase">Roteiro</span>
            <h2 className="text-4xl md:text-6xl font-serif">Como Chegar</h2>
            <p className="text-blue-200/30 font-sans text-xs md:text-sm tracking-luxury uppercase">Clube Comercial Catuípe — RS</p>
          </div>

          <div className="w-full relative group reveal">
            <div className="absolute -inset-1 bg-blue-500/20 rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-[#001d3d]/20 backdrop-blur-3xl rounded-[3rem] border border-blue-500/10 overflow-hidden shadow-2xl h-[450px] md:h-[550px]">
              <iframe 
                src="https://maps.google.com/maps?q=Clube+Comercial+Catuípe+RS&t=&z=17&ie=UTF8&iwloc=&output=embed" 
                width="100%" height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.9) contrast(1.2)' }} 
                allowFullScreen={true} loading="lazy" title="Mapa do Local"
              ></iframe>
              
              <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row gap-6 justify-between items-center bg-[#000814]/90 backdrop-blur-xl p-8 rounded-2xl border border-blue-500/20">
                <div className="text-center md:text-left">
                  <p className="text-white font-serif text-xl tracking-wide">Pronto para a festa?</p>
                  <p className="text-blue-400/50 font-sans text-[10px] uppercase tracking-luxury font-bold mt-2">Toque para traçar sua rota</p>
                </div>
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=Clube+Comercial+Catuípe+RS" 
                  target="_blank" rel="noopener noreferrer"
                  className="bg-blue-accent text-white px-10 py-4 rounded-xl font-sans font-bold uppercase tracking-luxury text-[10px] hover:scale-105 transition-all shadow-xl"
                >
                  TRAÇAR ROTA
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 text-center border-t border-blue-900/10 bg-[#00040a]">
        <div className="max-w-2xl mx-auto flex flex-col items-center space-y-8 reveal">
          <LogoIcon className="w-32 h-20 opacity-50" />
          <div className="space-y-2">
            <h4 className="text-3xl font-serif tracking-widest">Maria Valentina</h4>
            <p className="text-blue-500 font-sans uppercase tracking-ultra text-[10px] font-bold">Bacharel em Psicologia • 2026</p>
          </div>
          <p className="pt-10 text-blue-200/20 font-sans text-[9px] uppercase tracking-[0.2em] font-medium leading-loose max-w-lg mx-auto italic">
            "Conheça todas as teorias, domine todas as técnicas, mas ao tocar uma alma humana, seja apenas outra alma humana"
          </p>
          <div className="pt-20 opacity-10 hover:opacity-30 transition-opacity duration-500 flex flex-col items-center gap-2">
            <p className="text-[8px] font-sans text-white uppercase tracking-widest">Site desenvolvido por Igor A. Londero</p>
            <a href="https://instagram.com/igorlondero1" target="_blank" rel="noopener noreferrer" className="text-[8px] font-sans text-white uppercase tracking-widest hover:text-blue-400 transition-colors">@igorlondero1</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainSite;
