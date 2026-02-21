
import React, { useState, useEffect } from 'react';
import { AccessStatus, RSVPData } from './types';
import RsvpForm from './components/RsvpForm';
import MainSite from './components/MainSite';
import WelcomeHero from './components/WelcomeHero';
import AdminPanel from './components/AdminPanel';

const SPREADSHEET_ID = '1GPPD4VvLTwxDnANE_X7QB5UIZHfdNusx0EEsHiJKq_w';
const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwAX_VjK_mMIw_vYczPNkfGIlT7fAuaMBcnAkmDd5UnsiqgfUmVcso5rlBiUCvn0nXC/exec'; 

const App: React.FC = () => {
  const [status, setStatus] = useState<AccessStatus>('pending');
  const [userData, setUserData] = useState<RSVPData | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const checkExistingUser = async (name: string): Promise<RSVPData | null> => {
    try {
      const response = await fetch('/api/guests');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao buscar convidados');
      }
      const guests = await response.json();
      
      // Sort by timestamp descending to get the LATEST entry if duplicates exist
      const sortedGuests = [...guests].reverse();
      
      const found = sortedGuests.find((g: any) => 
        g.nome.trim().toLowerCase() === name.trim().toLowerCase()
      );

      if (found) {
        return {
          fullName: found.nome,
          email: found.email || found.contato || '',
          phone: found.tipo_contato === 'WhatsApp' ? (found.email || found.contato) : '',
          contactMethod: found.tipo_contato === 'WhatsApp' ? 'phone' : 'email',
          attending: found.comparecera === 'Sim',
          adultsCount: Math.max(0, (Number(found.adultos) || 0) - 1),
          childrenCount: Number(found.criancas) || 0,
          companions: found.acompanhantes && found.acompanhantes !== 'Nenhum' 
            ? found.acompanhantes.split(', ').map((c: string) => ({
                name: c.split(' (')[0],
                type: c.includes('Criança') ? 'Criança' : 'Adulto'
              }))
            : []
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao verificar usuário existente:', error);
      throw error; // Re-throw to handle in UI
    }
  };

  const handleRSVPSubmit = async (data: RSVPData) => {
    // Check if user exists before submitting a NEW registration
    if (!isEditing) {
      try {
        const existing = await checkExistingUser(data.fullName);
        if (existing) {
          // If they are already registered and attending, just log them in
          if (existing.attending) {
            setUserData(existing);
            setStatus('granted');
            localStorage.setItem('graduation_rsvp', JSON.stringify({ status: 'granted', data: existing }));
            return;
          }
        }
      } catch (e) {
        console.warn("Could not check existing user, proceeding with registration");
      }
    }

    const companionsNames = data.companions.map(c => `${c.name} (${c.type})`).join(', ');
    
    const payload = {
      action: 'upsert',
      timestamp: new Date().toLocaleString('pt-BR'),
      nome: data.fullName,
      email: data.contactMethod === 'email' ? data.email : data.phone,
      tipo_contato: data.contactMethod === 'email' ? 'E-mail' : 'WhatsApp',
      comparecera: data.attending ? 'Sim' : 'Não',
      adultos: data.attending ? String(Number(data.adultsCount) + 1) : '0',
      criancas: String(data.childrenCount),
      acompanhantes: companionsNames || 'Nenhum'
    };

    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar no servidor');

      setUserData(data);
      setIsEditing(false);
      if (data.attending) {
        setStatus('granted');
        localStorage.setItem('graduation_rsvp', JSON.stringify({ status: 'granted', data }));
      } else {
        setStatus('denied');
        localStorage.setItem('graduation_rsvp', JSON.stringify({ status: 'denied', data }));
      }
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('graduation_rsvp');
    setStatus('pending');
    setUserData(null);
  };

  useEffect(() => {
    const saved = localStorage.getItem('graduation_rsvp');
    if (saved) {
      const parsed = JSON.parse(saved);
      setStatus(parsed.status);
      setUserData(parsed.data);
    }
  }, []);

  if (showAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} spreadsheetLink={SPREADSHEET_URL} webAppUrl={WEB_APP_URL} />;
  }

  if (isEditing && userData) {
    return (
      <div className="relative min-h-screen py-20 px-4 flex flex-col items-center overflow-hidden">
        {/* Background Image with Blue Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/d/1Ih-vra04izevSyEHZLVeroPbGsAX68E0")' }}
        >
          <div className="absolute inset-0 bg-[#000814]/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 mb-10 text-center">
          <h2 className="text-3xl font-serif text-white uppercase tracking-widest">Atualizar Cadastro</h2>
          <button 
            onClick={() => setIsEditing(false)}
            className="mt-4 text-[9px] font-bold text-blue-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            Cancelar Alterações
          </button>
        </div>
        <div className="relative z-10 w-full flex flex-col items-center">
          <RsvpForm onSubmit={handleRSVPSubmit} initialData={userData} />
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-6 text-center overflow-hidden">
        {/* Background Image with Blue Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/d/1Ih-vra04izevSyEHZLVeroPbGsAX68E0")' }}
        >
          <div className="absolute inset-0 bg-[#000814]/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 max-w-md bg-blue-950/20 p-12 rounded-[3rem] border border-blue-900/30 shadow-2xl backdrop-blur-xl">
          <h2 className="text-3xl font-serif text-white mb-6 uppercase tracking-widest">Resposta Recebida</h2>
          <p className="text-blue-200/60 leading-relaxed">
            Sentiremos sua falta, {userData?.fullName.split(' ')[0]}!
            Caso mude de ideia, você pode atualizar sua resposta abaixo.
          </p>
          <div className="mt-12 flex flex-col gap-6">
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-accent text-white py-4 rounded-xl font-sans font-bold uppercase tracking-luxury text-[10px] hover:scale-105 transition-all"
            >
              MUDAR PARA "VOU COMPARECER"
            </button>
            <div className="h-px w-12 bg-blue-900/30 mx-auto"></div>
            <button 
              onClick={() => setShowAdmin(true)}
              className="text-[9px] text-blue-900 hover:text-blue-700 uppercase tracking-widest transition-colors"
            >
              Acesso Restrito
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'granted' && userData) {
    return (
      <>
        <MainSite userData={userData} onEdit={() => setIsEditing(true)} onLogout={handleLogout} />
        <div className="bg-[#00040a] py-10 text-center border-t border-blue-900/10">
           <button 
             onClick={() => setShowAdmin(true)}
             className="text-[10px] text-blue-900 hover:text-blue-500 uppercase tracking-[0.3em] font-bold transition-colors"
           >
             Administração
           </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#000814] text-white overflow-x-hidden">
      <WelcomeHero />
      <div id="rsvp-section" className="relative py-10 px-4 flex flex-col items-center overflow-hidden">
        
        <div className="relative z-10 w-full flex flex-col items-center">
          <RsvpForm onSubmit={handleRSVPSubmit} onCheckExisting={checkExistingUser} />
          <button 
            onClick={() => setShowAdmin(true)}
            className="mt-20 text-[10px] text-blue-900 hover:text-blue-400 uppercase tracking-[0.5em] font-bold transition-all"
          >
            Acesso Administrativo
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
