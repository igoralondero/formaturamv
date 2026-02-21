
import React, { useState, useEffect } from 'react';
import { RSVPData, Companion } from '../types';

interface RSVPFormProps {
  onSubmit: (data: RSVPData) => Promise<void>;
  onCheckExisting?: (name: string) => Promise<RSVPData | null>;
  initialData?: RSVPData;
}

const RsvpForm: React.FC<RSVPFormProps> = ({ onSubmit, onCheckExisting, initialData }) => {
  const [attending, setAttending] = useState<boolean | null>(initialData?.attending ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [autoFound, setAutoFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>(initialData?.contactMethod ?? 'email');
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    adultsCount: initialData?.adultsCount ?? 0,
    childrenCount: initialData?.childrenCount ?? 0,
  });
  const [companions, setCompanions] = useState<Companion[]>(initialData?.companions ?? []);

  const handleAttendance = (status: boolean) => {
    setAttending(status);
    setError(null);
  };

  const handleCountsChange = (type: 'adults' | 'children', val: number) => {
    const newVal = Math.max(0, val);
    const nextAdults = type === 'adults' ? newVal : formData.adultsCount;
    const nextChildren = type === 'children' ? newVal : formData.childrenCount;
    
    setFormData(prev => ({ ...prev, [type === 'adults' ? 'adultsCount' : 'childrenCount']: newVal }));

    const newArray: Companion[] = [];
    // Tenta preservar nomes existentes ao mudar a contagem
    for (let i = 0; i < nextAdults; i++) {
      newArray.push(companions.filter(c => c.type === 'Adulto')[i] || { name: '', type: 'Adulto' });
    }
    for (let i = 0; i < nextChildren; i++) {
      newArray.push(companions.filter(c => c.type === 'Criança')[i] || { name: '', type: 'Criança' });
    }
    setCompanions(newArray);
  };

  const updateCompanionName = (index: number, name: string) => {
    const updated = [...companions];
    updated[index].name = name;
    setCompanions(updated);
  };

  const handleCheckExisting = async () => {
    if (!formData.fullName.trim()) {
      setError('Por favor, digite seu nome no campo abaixo primeiro.');
      const input = document.getElementById('full-name-input');
      input?.focus();
      return;
    }
    setIsChecking(true);
    setError(null);
    
    try {
      if (onCheckExisting) {
        const existing = await onCheckExisting(formData.fullName);
        if (existing) {
          setAutoFound(true);
          // Trigger the parent's logic to log them in
          await onSubmit(existing);
        } else {
          setError('Ainda não encontramos seu nome na lista. Se for seu primeiro acesso, continue preenchendo abaixo.');
        }
      }
    } catch (err) {
      setError('Erro ao verificar cadastro. Tente novamente.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attending === null) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        contactMethod,
        attending,
        companions,
      });
    } catch (err) {
      setError('Erro ao enviar confirmação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (autoFound) {
    return (
      <div className="w-full max-w-2xl bg-[#001d3d]/60 backdrop-blur-3xl p-10 md:p-16 rounded-[3rem] border border-blue-400/20 text-center animate-fadeIn shadow-2xl">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
          <div className="w-8 h-8 border-r-2 border-b-2 border-white rotate-45 mb-2"></div>
        </div>
        <h3 className="text-3xl font-serif text-white mb-4">Seja bem-vindo(a)!</h3>
        <p className="text-blue-200/60 font-sans text-lg leading-relaxed mb-8">
          Reconhecemos seu cadastro. <br/> Você já pode acessar o site completo.
        </p>
        <div className="w-16 h-[2px] bg-blue-500 mx-auto rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-2xl bg-[#001d3d]/20 backdrop-blur-3xl p-6 sm:p-12 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-blue-500/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group animate-fadeIn"
    >
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-400/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 text-center mb-8 md:mb-12">
        <p className="text-blue-400/60 font-sans text-[10px] uppercase tracking-ultra font-bold px-4 leading-relaxed">
          {initialData ? 'Atualizar meus Dados' : 'Novo Registro de Presença'}
        </p>
      </div>

      <div className="relative z-10 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-sans font-bold text-blue-400 uppercase tracking-luxury block px-1">Nome Completo</label>
          <input
            id="full-name-input"
            required
            disabled={isSubmitting || isChecking || !!initialData}
            type="text"
            className="w-full bg-[#000814]/80 border border-blue-500/20 rounded-xl px-6 py-5 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-blue-900/30 font-sans font-medium text-base"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Digite seu nome completo..."
          />
        </div>

        <div className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
            <label className="text-[10px] font-sans font-bold text-blue-400 uppercase tracking-luxury">Meio de Contato</label>
            <div className="flex bg-[#000814]/60 p-1 rounded-lg border border-blue-500/10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setContactMethod('email')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-[9px] font-sans font-bold uppercase tracking-widest transition-all ${contactMethod === 'email' ? 'bg-blue-accent text-white shadow-md' : 'text-blue-400/40 hover:text-blue-300'}`}
              >
                E-mail
              </button>
              <button
                type="button"
                onClick={() => setContactMethod('phone')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-[9px] font-sans font-bold uppercase tracking-widest transition-all ${contactMethod === 'phone' ? 'bg-blue-accent text-white shadow-md' : 'text-blue-400/40 hover:text-blue-300'}`}
              >
                WhatsApp
              </button>
            </div>
          </div>
          
          <input
            required
            disabled={isSubmitting}
            type={contactMethod === 'email' ? 'email' : 'tel'}
            className="w-full bg-[#000814]/80 border border-blue-500/20 rounded-xl px-6 py-5 text-white focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-blue-900/30 font-sans font-medium text-base"
            value={contactMethod === 'email' ? formData.email : formData.phone}
            onChange={(e) => setFormData({ ...formData, [contactMethod === 'email' ? 'email' : 'phone']: e.target.value })}
            placeholder={contactMethod === 'email' ? "exemplo@email.com" : "(00) 00000-0000"}
          />
        </div>

        <div className="py-10 border-y border-blue-500/10 space-y-8">
          <p className="text-blue-100/60 font-sans text-center font-bold text-[10px] tracking-luxury uppercase leading-relaxed px-4">Você celebrará conosco?</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              disabled={isSubmitting}
              type="button"
              onClick={() => handleAttendance(true)}
              className={`py-6 rounded-2xl border-2 font-sans font-bold uppercase tracking-luxury text-[10px] transition-all duration-300 flex items-center justify-center ${
                attending === true 
                ? 'bg-blue-accent text-white border-blue-400 shadow-xl' 
                : 'border-blue-500/10 text-blue-400/30 hover:bg-blue-500/5'
              }`}
            >
              SIM
            </button>
            <button
              disabled={isSubmitting}
              type="button"
              onClick={() => handleAttendance(false)}
              className={`py-6 rounded-2xl border-2 font-sans font-bold uppercase tracking-luxury text-[10px] transition-all duration-300 flex items-center justify-center ${
                attending === false 
                ? 'bg-blue-950 text-blue-200 border-blue-700' 
                : 'border-blue-500/10 text-blue-400/30 hover:bg-blue-500/5'
              }`}
            >
              NÃO
            </button>
          </div>
        </div>

        {attending === true && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <label className="text-[10px] font-sans font-bold text-blue-400 uppercase tracking-luxury text-center block">Convidados Extras</label>
                <div className="flex items-center justify-between bg-[#000814]/60 border border-blue-500/20 rounded-xl px-4 py-3">
                   <button type="button" onClick={() => handleCountsChange('adults', formData.adultsCount - 1)} className="text-blue-400 text-xl font-bold w-10 h-10 flex items-center justify-center hover:bg-blue-500/10 rounded-lg">-</button>
                   <span className="font-serif text-2xl text-white w-12 text-center">{formData.adultsCount}</span>
                   <button type="button" onClick={() => handleCountsChange('adults', formData.adultsCount + 1)} className="text-blue-400 text-xl font-bold w-10 h-10 flex items-center justify-center hover:bg-blue-500/10 rounded-lg">+</button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-sans font-bold text-blue-400 uppercase tracking-luxury text-center block">Crianças</label>
                <div className="flex items-center justify-between bg-[#000814]/60 border border-blue-500/20 rounded-xl px-4 py-3">
                   <button type="button" onClick={() => handleCountsChange('children', formData.childrenCount - 1)} className="text-blue-400 text-xl font-bold w-10 h-10 flex items-center justify-center hover:bg-blue-500/10 rounded-lg">-</button>
                   <span className="font-serif text-2xl text-white w-12 text-center">{formData.childrenCount}</span>
                   <button type="button" onClick={() => handleCountsChange('children', formData.childrenCount + 1)} className="text-blue-400 text-xl font-bold w-10 h-10 flex items-center justify-center hover:bg-blue-500/10 rounded-lg">+</button>
                </div>
              </div>
            </div>

            {companions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-blue-500/10">
                <p className="text-[10px] font-sans font-bold text-blue-400 uppercase tracking-luxury text-center">Nomes dos Acompanhantes</p>
                <div className="space-y-3">
                  {companions.map((comp, idx) => (
                    <div key={idx} className="relative">
                      <input
                        required
                        type="text"
                        placeholder={`Nome do ${comp.type}...`}
                        className="w-full bg-[#000814]/40 border border-blue-500/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-blue-400/40 transition-all font-sans"
                        value={comp.name}
                        onChange={(e) => updateCompanionName(idx, e.target.value)}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-sans font-bold text-blue-500/30 uppercase tracking-widest">{comp.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-400 text-[10px] font-sans font-bold uppercase tracking-widest text-center animate-fadeIn bg-red-500/5 py-3 rounded-lg border border-red-500/10">
            {error}
          </p>
        )}

        <button
          disabled={attending === null || isSubmitting || isChecking}
          type="submit"
          className={`w-full py-6 rounded-2xl font-sans font-bold uppercase tracking-ultra text-[11px] transition-all duration-300 flex items-center justify-center shadow-2xl ${
            attending === null || isSubmitting || isChecking
            ? 'bg-blue-900/10 text-blue-900/30 cursor-not-allowed border border-blue-900/5' 
            : 'bg-white text-blue-950 hover:scale-[1.01] active:scale-[0.99] hover:shadow-white/10'
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-blue-950/20 border-t-blue-950 rounded-full animate-spin"></div>
          ) : (
            initialData ? "ATUALIZAR DADOS" : "CONFIRMAR PRESENÇA"
          )}
        </button>

        {!initialData && (
          <div className="relative z-20 mt-12 p-6 md:p-10 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 shadow-inner">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                 <h3 className="text-white font-sans font-bold text-xs md:text-sm uppercase tracking-widest">Acesso Rápido</h3>
              </div>
              <p className="text-blue-200/40 font-sans text-[11px] md:text-xs leading-relaxed font-medium">
                Se já confirmou sua presença pelo site, digite seu nome acima e acesse aqui para entrar no ambiente exclusivo.
              </p>
              <button 
                type="button" 
                onClick={handleCheckExisting}
                disabled={isChecking}
                className="w-full bg-blue-accent text-white py-4 rounded-xl font-sans font-bold uppercase tracking-luxury text-[10px] md:text-xs hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-blue-400/20"
              >
                {isChecking ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "ENTRAR NO SITE"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default RsvpForm;
