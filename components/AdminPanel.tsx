
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import LogoIcon from './LogoIcon';

interface GuestData {
  timestamp: string;
  nome: string;
  email?: string;
  contato?: string;
  comparecera: string;
  adultos: number | string;
  criancas: number | string;
}

interface AdminPanelProps {
  onClose: () => void;
  spreadsheetLink: string;
  webAppUrl: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, spreadsheetLink, webAppUrl }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [photos, setPhotos] = useState<{url: string, legenda: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'guests' | 'photos'>('guests');
  const [newPhoto, setNewPhoto] = useState({ url: '', legenda: '' });

  const fetchGuests = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/guests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Falha ao buscar convidados');
      const data = await response.json();
      
      const uniqueGuests: Record<string, GuestData> = {};
      data.forEach((guest: GuestData) => {
        const key = guest.nome.trim().toLowerCase();
        uniqueGuests[key] = guest;
      });
      
      setGuests(Object.values(uniqueGuests));
    } catch (err) {
      console.error("Erro ao buscar convidados:", err);
      setError('Erro ao carregar dados.');
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchGuests();
      fetchPhotos();
    }
  }, [isLoggedIn, token]);

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.url || !token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPhoto)
      });
      if (response.ok) {
        setNewPhoto({ url: '', legenda: '' });
        fetchPhotos();
      }
    } catch (err) {
      console.error("Erro ao adicionar foto:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        // Agora o token é a própria senha (ou hash) retornada pelo servidor
        const data = await response.json();
        setToken(data.token);
        setIsLoggedIn(true);
        setError('');
      } else {
        setError('Senha incorreta.');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const totals = guests.reduce((acc, guest) => {
    if (guest.comparecera === 'Sim') {
      acc.confirmed += 1;
      acc.adults += (Number(guest.adultos) || 0);
      acc.children += (Number(guest.criancas) || 0);
    }
    return acc;
  }, { confirmed: 0, adults: 0, children: 0 });

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#000814]/98 backdrop-blur-3xl flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#001d3d]/60 border border-blue-500/20 p-10 md:p-12 rounded-[2.5rem] shadow-2xl relative">
          <button onClick={onClose} className="absolute top-6 right-8 text-blue-400 font-sans font-bold uppercase text-[9px] tracking-ultra hover:text-white transition-colors">Fechar</button>
          <div className="text-center mb-10">
            <LogoIcon className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-serif text-white tracking-widest">Painel Admin</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              placeholder="Senha de Acesso"
              className="w-full bg-[#000814]/60 border border-blue-500/10 rounded-xl px-6 py-4 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all font-sans"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-400 text-[10px] text-center font-sans font-bold uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full bg-blue-accent text-white py-4 rounded-xl font-sans font-bold uppercase tracking-luxury text-xs hover:scale-[1.02] transition-all">
              Acessar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#000814] flex flex-col text-white font-sans">
      <header className="bg-[#001d3d]/30 border-b border-blue-500/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <LogoIcon className="w-10 h-10" />
          <h2 className="font-serif text-2xl tracking-widest">Controle RSVP</h2>
          {isLoading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
        </div>
        <div className="flex flex-wrap gap-4 justify-center md:justify-end">
          <div className="flex bg-blue-500/5 p-1 rounded-full border border-blue-500/10">
            <button 
              onClick={() => setActiveTab('guests')}
              className={`px-6 py-2 rounded-full text-[9px] font-sans font-bold uppercase tracking-widest transition-all ${activeTab === 'guests' ? 'bg-blue-accent text-white' : 'text-blue-400/40 hover:text-blue-300'}`}
            >
              Convidados
            </button>
            <button 
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-2 rounded-full text-[9px] font-sans font-bold uppercase tracking-widest transition-all ${activeTab === 'photos' ? 'bg-blue-accent text-white' : 'text-blue-400/40 hover:text-blue-300'}`}
            >
              Galeria
            </button>
          </div>
          <button onClick={activeTab === 'guests' ? fetchGuests : fetchPhotos} className="text-[9px] font-sans font-bold bg-blue-500/10 text-blue-400 px-6 py-3 rounded-full hover:bg-blue-500/20 transition-all uppercase tracking-luxury border border-blue-500/20">
            Sincronizar
          </button>
          <button 
            onClick={onClose}
            className="text-[9px] font-sans font-bold text-blue-400 border border-blue-500/20 px-3 py-3 rounded-full hover:bg-blue-500/10 transition-all uppercase tracking-luxury flex items-center justify-center"
            title="Voltar ao Convite"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="text-[9px] font-sans font-bold text-white/40 hover:text-white px-4 transition-colors uppercase tracking-luxury">Sair</button>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {activeTab === 'guests' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Convites', val: totals.confirmed },
                  { label: 'Adultos', val: totals.adults },
                  { label: 'Crianças', val: totals.children }
                ].map((stat, i) => (
                  <div key={i} className="bg-blue-950/20 p-10 rounded-[2.5rem] border border-blue-500/10 shadow-lg text-center">
                    <p className="text-blue-400/40 text-[9px] uppercase font-bold tracking-ultra mb-4">{stat.label}</p>
                    <p className="text-6xl font-serif text-white">{stat.val}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#001d3d]/10 rounded-[3rem] border border-blue-500/10 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-blue-500/10 flex justify-between items-center bg-blue-500/5">
                  <h3 className="text-lg font-serif tracking-widest">Lista de Convidados</h3>
                  <a href={spreadsheetLink} target="_blank" className="text-[9px] font-sans font-bold text-blue-400 border border-blue-500/20 px-6 py-3 rounded-full hover:bg-blue-500/10 transition-all uppercase tracking-luxury">Ver Planilha</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#000814]/50 text-blue-400/50 text-[9px] uppercase tracking-luxury font-bold">
                        <th className="px-8 py-5">Convidado</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-center">Adultos</th>
                        <th className="px-8 py-5 text-center">Crianças</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-500/5">
                      {guests.length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-20 text-center text-blue-400/20 font-sans italic">Nenhum registro encontrado...</td></tr>
                      ) : (
                        guests.map((guest, i) => (
                          <tr key={i} className="text-sm text-blue-100/70 hover:bg-blue-500/5 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{guest.nome}</div>
                              <div className="text-[10px] text-blue-400/30 uppercase tracking-widest mt-1 font-sans">{guest.email || guest.contato || 'Sem contato'}</div>
                            </td>
                            <td className="px-8 py-6 align-middle">
                              <span className={`px-4 py-1.5 rounded-full text-[8px] font-sans font-bold uppercase tracking-widest ${
                                guest.comparecera === 'Sim' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/5 text-red-400 border border-red-500/10'
                              }`}>
                                {guest.comparecera === 'Sim' ? 'Presente' : 'Ausente'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-center font-serif text-xl text-blue-400/60 align-middle">{guest.adultos}</td>
                            <td className="px-8 py-6 text-center font-serif text-xl text-blue-400/60 align-middle">{guest.criancas}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-10">
              <div className="bg-[#001d3d]/10 rounded-[3rem] border border-blue-500/10 p-10 shadow-2xl">
                <h3 className="text-lg font-serif tracking-widest mb-8">Adicionar Foto</h3>
                <form onSubmit={handleAddPhoto} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input
                    type="text"
                    placeholder="URL da Imagem (Google Drive, Imgur, etc)"
                    className="md:col-span-2 bg-[#000814]/60 border border-blue-500/10 rounded-xl px-6 py-4 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all font-sans"
                    value={newPhoto.url}
                    onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Legenda (Opcional)"
                    className="bg-[#000814]/60 border border-blue-500/10 rounded-xl px-6 py-4 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all font-sans"
                    value={newPhoto.legenda}
                    onChange={(e) => setNewPhoto({ ...newPhoto, legenda: e.target.value })}
                  />
                  <button type="submit" disabled={isLoading} className="md:col-span-3 bg-blue-accent text-white py-4 rounded-xl font-sans font-bold uppercase tracking-luxury text-xs hover:scale-[1.01] transition-all">
                    {isLoading ? 'Salvando...' : 'Adicionar à Galeria'}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {photos.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-blue-400/20 font-sans italic">Nenhuma foto na galeria...</div>
                ) : (
                  photos.map((photo, i) => (
                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-blue-500/10 bg-blue-950/20">
                      <img src={photo.url} alt={photo.legenda} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000814] to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                        <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-white truncate">{photo.legenda || 'Sem legenda'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;