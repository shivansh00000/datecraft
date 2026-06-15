import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Heart, ArrowLeft, Eye, Save, Sparkles, Plus, Trash2, ArrowUp, ArrowDown, 
  Settings as SettingsIcon, Image, Music, FileText, ChevronRight, Upload, Sparkle, Trophy, ExternalLink
} from 'lucide-react';

const fontOptions = ['Inter', 'Outfit', 'Playfair Display', 'Great Vibes'];
const bgStyles = [
  { value: 'gradient-pink', label: '🌹 Classic Rose', gradient: 'from-pink-100 via-rose-200 to-pink-300', font: 'Great Vibes', desc: 'Milk pink, rose petals & cursive script.' },
  { value: 'starry-dark', label: '✨ Starry Night', gradient: 'from-indigo-950 via-slate-900 to-indigo-950', font: 'Outfit', desc: 'twinkling meteors & indigo neon glass.' },
  { value: 'warm-cozy', label: '☕ Coffee Date', gradient: 'from-[#fffbf0] via-[#f5ede0] to-[#e8dec9]', font: 'Inter', desc: 'Yellow lined notebook notepad paper.' },
  { value: 'cinematic-dark', label: '🎬 Movie Night', gradient: 'from-red-950 via-neutral-900 to-red-950', font: 'Outfit', desc: 'Retro theater ticket stub frames.' },
  { value: 'sunset-orange', label: '🌇 Sunset Dream', gradient: 'from-purple-900 via-orange-950 to-orange-900', font: 'Outfit', desc: 'Lens flares & twilight sky meshes.' },
  { value: 'pastel-gold', label: '💎 Minimal Luxury', gradient: 'from-stone-50 via-stone-200 to-stone-300', font: 'Playfair Display', desc: 'Gold borders & premium serifs.' }
];

export default function ProposalBuilder() {
  const { id } = useParams();
  const { api, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('sec-hero');
  const [proposal, setProposal] = useState(null);

  // AI loading indicators
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch proposal data
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/proposals/${id}`);
        if (res.data.success) {
          setProposal(res.data.proposal);
        }
      } catch (error) {
        console.error('Error fetching proposal:', error.message);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put(`/api/proposals/${id}`, proposal);
      if (res.data.success) {
        setProposal(res.data.proposal);
        alert('Proposal configurations saved successfully! ❤️');
      }
    } catch (error) {
      console.error('Error saving proposal:', error.message);
      alert('Error saving proposal configurations.');
    } finally {
      setSaving(false);
    }
  };

  // Section visibility toggling
  const toggleSection = (sectionId) => {
    setProposal(prev => {
      const updated = prev.sections.map(sec => 
        sec.id === sectionId ? { ...sec, enabled: !sec.enabled } : sec
      );
      return { ...prev, sections: updated };
    });
  };

  // Move section order up/down
  const moveSection = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === proposal.sections.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setProposal(prev => {
      const sects = [...prev.sections];
      const temp = sects[index];
      sects[index] = sects[newIndex];
      sects[newIndex] = temp;
      
      const updated = sects.map((s, idx) => ({ ...s, order: idx }));
      return { ...prev, sections: updated };
    });
  };

  // Upload handler for Memories/Photos/Music
  const handleFileUpload = async (e, type, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const fileUrl = res.data.url;
        
        if (type === 'memory' && index !== null) {
          setProposal(prev => {
            const updatedMem = [...prev.memories];
            updatedMem[index].image = fileUrl;
            return { ...prev, memories: updatedMem };
          });
        } else if (type === 'media') {
          setProposal(prev => {
            const updatedMedia = [...prev.media, { url: fileUrl, type: res.data.type, publicId: res.data.publicId }];
            return { ...prev, media: updatedMedia };
          });
        } else if (type === 'music') {
          setProposal(prev => ({
            ...prev,
            theme: { ...prev.theme, musicUrl: fileUrl }
          }));
        }
      }
    } catch (error) {
      console.error('File upload error:', error.message);
      alert('Upload failed. Please check file type and size.');
    }
  };

  // AI assistance text generator
  const triggerAiHelp = async (contentType) => {
    try {
      setAiLoading(true);
      const res = await api.post('/api/ai/generate', {
        type: contentType,
        girlName: proposal.girlName,
        nickname: proposal.nickname,
        creatorName: user?.name
      });

      if (res.data.success) {
        const generated = res.data.result;
        
        if (contentType === 'love_letter') {
          setProposal(prev => ({
            ...prev,
            loveLetter: { ...prev.loveLetter, letter: generated }
          }));
        } else if (contentType === 'compliment') {
          setProposal(prev => ({
            ...prev,
            compliments: [...prev.compliments, generated]
          }));
        } else if (contentType === 'question') {
          setProposal(prev => ({
            ...prev,
            questions: [
              ...prev.questions,
              { id: 'q-' + Date.now(), questionText: generated, type: 'text', required: false }
            ]
          }));
        }
      }
    } catch (error) {
      console.error('AI helper error:', error.message);
    } finally {
      setAiLoading(false);
    }
  };

  // State management helpers
  const updateBasicField = (field, value) => {
    setProposal(prev => ({ ...prev, [field]: value }));
  };

  const updateThemeField = (field, value) => {
    setProposal(prev => ({
      ...prev,
      theme: { ...prev.theme, [field]: value }
    }));
  };

  const updateLoveLetterField = (field, value) => {
    setProposal(prev => ({
      ...prev,
      loveLetter: { ...prev.loveLetter, [field]: value }
    }));
  };

  const updateNoBehaviorField = (field, value) => {
    setProposal(prev => ({
      ...prev,
      noButtonBehavior: { ...prev.noButtonBehavior, [field]: value }
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  // Background CSS map for live preview rendering
  const themeClassMap = {
    'gradient-pink': 'theme-bg-gradient-pink',
    'starry-dark': 'theme-bg-starry-dark',
    'warm-cozy': 'theme-bg-warm-cozy',
    'cinematic-dark': 'theme-bg-cinematic-dark',
    'sunset-orange': 'theme-bg-sunset-orange',
    'pastel-gold': 'theme-bg-pastel-gold'
  };

  const currentThemeBg = themeClassMap[proposal.theme.bgStyle] || 'bg-slate-950';

  const theme = proposal.theme;

  const fontClass = 
    theme.fontFamily === 'Outfit' ? 'font-fantasy' : 
    theme.fontFamily === 'Playfair Display' ? 'font-serif' : 
    theme.fontFamily === 'Great Vibes' ? 'font-cursive font-normal' : 
    theme.fontFamily === 'Sacramento' ? 'font-handwritten font-normal' : 'font-sans';

  // Responsive font sizes helpers for handwriting script vs normal fonts
  const getHeadingStyle = () => {
    const isScript = theme.fontFamily === 'Great Vibes' || theme.fontFamily === 'Sacramento';
    return isScript 
      ? 'text-4xl md:text-5xl font-normal tracking-wide text-center leading-snug' 
      : 'text-2xl md:text-3xl font-extrabold tracking-tight text-center leading-tight';
  };

  const getSubheadingStyle = () => {
    const isScript = theme.fontFamily === 'Great Vibes' || theme.fontFamily === 'Sacramento';
    return isScript 
      ? 'text-2xl md:text-3xl font-normal text-center leading-normal' 
      : 'text-lg md:text-xl font-bold text-center';
  };

  const getBodyStyle = () => {
    const isScript = theme.fontFamily === 'Great Vibes' || theme.fontFamily === 'Sacramento';
    return isScript 
      ? 'text-xl md:text-2xl leading-relaxed font-normal' 
      : 'text-xs md:text-sm leading-relaxed opacity-90';
  };

  const getNoteStyle = () => {
    const isScript = theme.fontFamily === 'Great Vibes' || theme.fontFamily === 'Sacramento';
    return isScript 
      ? 'text-lg md:text-xl italic font-normal opacity-85' 
      : 'text-[11px] md:text-xs italic opacity-75';
  };

  // Customize layout card styling based on the active theme
  const getThemeCardStyles = () => {
    switch (theme.bgStyle) {
      case 'gradient-pink':
        return 'bg-white/85 border border-pink-100 shadow-[0_15px_35px_rgba(244,63,94,0.15)] rounded-3xl text-rose-950';
      case 'starry-dark':
        return 'bg-slate-900/60 border border-indigo-500/30 shadow-[0_20px_50px_rgba(99,102,241,0.2)] rounded-[32px] backdrop-blur-xl text-indigo-50';
      case 'warm-cozy':
        return 'bg-[#fffefb] border border-amber-900/10 shadow-xl rounded-3xl text-amber-950 overflow-hidden pt-10 pl-10 pr-6 pb-6';
      case 'cinematic-dark':
        return 'bg-neutral-900/95 border-2 border-red-600/40 shadow-2xl rounded-sm text-red-50 py-8 px-6 overflow-hidden';
      case 'sunset-orange':
        return 'bg-slate-950/70 border border-orange-500/30 shadow-2xl rounded-[28px] text-orange-50 backdrop-blur-xl';
      case 'pastel-gold':
        return 'bg-stone-50 border border-[#d4af37]/60 shadow-xl rounded-none text-stone-900 p-8';
      default:
        return 'bg-slate-900/70 border border-slate-800 rounded-[32px] text-white shadow-2xl';
    }
  };

  const getThemeTextHighlight = () => {
    switch (theme.bgStyle) {
      case 'gradient-pink': return 'text-rose-600';
      case 'starry-dark': return 'text-amber-400';
      case 'warm-cozy': return 'text-amber-800';
      case 'cinematic-dark': return 'text-red-500';
      case 'sunset-orange': return 'text-orange-400';
      case 'pastel-gold': return 'text-[#b89726]';
      default: return 'text-rose-500';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Header */}
      <header className="h-16 border-b border-slate-900 bg-slate-950 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white font-fantasy flex items-center gap-1.5">
              Editing: {proposal.girlName}'s Proposal <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            </h1>
            <p className="text-[10px] text-slate-500">Slug: /p/{proposal.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/p/${proposal.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Eye className="h-3.5 w-3.5" /> Preview Link <ExternalLink className="h-3 w-3" />
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 h-9 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Navigation Panel */}
        <div className="w-80 border-r border-slate-900 bg-slate-950 flex flex-col justify-between overflow-y-auto">
          <div className="p-4 space-y-6">
            
            {/* Aesthetics config */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <SettingsIcon className="h-3.5 w-3.5" /> Adorable Themes
              </h3>
              
              {/* Visual Theme Selector Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900/30 p-2.5 rounded-2xl border border-slate-900">
                {bgStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => {
                      updateThemeField('bgStyle', style.value);
                      updateThemeField('name', style.label.replace(/^[^\s]+\s+/, ''));
                      updateThemeField('fontFamily', style.font);
                    }}
                    className={`relative p-2 rounded-xl text-left border flex flex-col justify-between h-24 transition-all overflow-hidden ${
                      proposal.theme.bgStyle === style.value
                        ? 'border-rose-500 bg-rose-500/5 ring-1 ring-rose-500/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    {/* mini visual gradient preview */}
                    <div className={`w-full h-8 rounded bg-gradient-to-r ${style.gradient} border border-slate-800/20`} />
                    <div className="mt-1">
                      <p className="text-[10px] font-bold text-white truncate leading-none">{style.label}</p>
                      <p className="text-[7px] text-slate-500 leading-snug mt-0.5 truncate">{style.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Extras styling */}
              <div className="space-y-2.5 bg-slate-900/30 p-3 rounded-2xl border border-slate-900">
                <div className="text-xs">
                  <label className="text-slate-500 font-medium block mb-1">Typography Font</label>
                  <select
                    value={proposal.theme.fontFamily}
                    onChange={(e) => updateThemeField('fontFamily', e.target.value)}
                    className="w-full h-8 bg-slate-950 border border-slate-800 rounded px-2 text-white"
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="text-xs">
                  <label className="text-slate-500 font-medium block mb-1">Background Music URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Upload MP3 or paste URL"
                      value={proposal.theme.musicUrl || ''}
                      onChange={(e) => updateThemeField('musicUrl', e.target.value)}
                      className="w-full h-8 pl-2 pr-8 bg-slate-950 border border-slate-800 rounded text-white text-[11px]"
                    />
                    <label className="absolute right-2 top-2 text-slate-400 hover:text-white cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />
                      <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={(e) => handleFileUpload(e, 'music')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-slate-500 font-medium block mb-1">Confetti Particle Style</label>
                  <select
                    value={proposal.theme.confettiType || 'hearts'}
                    onChange={(e) => updateThemeField('confettiType', e.target.value)}
                    className="w-full h-8 bg-slate-950 border border-slate-800 rounded px-2 text-white"
                  >
                    <option value="hearts">Rose Hearts 🌹</option>
                    <option value="stars">Gold Stars ✨</option>
                    <option value="flowers">Cherry Blossoms 🌸</option>
                    <option value="food">Cupcakes & Waffles 🧁</option>
                  </select>
                </div>

                <div className="text-xs">
                  <label className="text-slate-500 font-medium block mb-1">Ambient Soundscape Loop</label>
                  <select
                    value={proposal.theme.ambientSound || 'none'}
                    onChange={(e) => updateThemeField('ambientSound', e.target.value)}
                    className="w-full h-8 bg-slate-950 border border-slate-800 rounded px-2 text-white"
                  >
                    <option value="none">None (Default) 🔇</option>
                    <option value="rain">Rain & Storms 🌧️</option>
                    <option value="fireplace">Cozy Fireplace 🔥</option>
                    <option value="waves">Ocean Waves 🌊</option>
                    <option value="lofi">Gentle Lofi Loop 🎵</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Layout Sections List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page Sections</h3>
              
              <div className="space-y-1.5">
                {proposal.sections.map((sec, idx) => (
                  <div 
                    key={sec.id}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                      activeSection === sec.id 
                        ? 'bg-rose-500/10 border-rose-500/30 text-white' 
                        : 'bg-slate-900/10 border-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <button
                      onClick={() => setActiveSection(sec.id)}
                      className="flex-1 flex items-center gap-2 text-left text-xs font-bold font-fantasy pl-1.5"
                    >
                      <ChevronRight className={`h-3.5 w-3.5 transition-transform ${activeSection === sec.id ? 'rotate-90 text-rose-500' : ''}`} />
                      <span className="capitalize">
                        {sec.type === 'mini_game' ? 'Chemistry Check 🧪' : sec.type.replace('_', ' ')}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleSection(sec.id)}
                        className={`w-7 h-4 rounded-full p-0.5 transition-colors ${sec.enabled ? 'bg-rose-600' : 'bg-slate-800'}`}
                      >
                        <div className={`h-3 w-3 rounded-full bg-white transition-transform ${sec.enabled ? 'transform translate-x-3' : ''}`} />
                      </button>

                      <button onClick={() => moveSection(idx, 'up')} className="p-0.5 text-slate-600 hover:text-slate-300" disabled={idx === 0}>
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button onClick={() => moveSection(idx, 'down')} className="p-0.5 text-slate-600 hover:text-slate-300" disabled={idx === proposal.sections.length - 1}>
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Center Live Preview */}
        <div className="flex-1 bg-slate-900 p-8 flex items-center justify-center overflow-auto relative">
          <div className="w-[375px] h-[667px] rounded-[40px] border-8 border-slate-950 shadow-2xl relative overflow-hidden bg-slate-950 flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-950 flex justify-center z-40">
              <div className="w-24 h-4 bg-slate-950 rounded-b-xl" />
            </div>

            {/* Inner Content Window */}
            <div className={`flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center ${currentThemeBg} ${fontClass} relative`}>
              
              {proposal.theme.bgStyle === 'starry-dark' && (
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute top-1/4 left-10 text-xs twinkle-star">★</div>
                  <div className="absolute top-1/3 right-12 text-sm twinkle-star">★</div>
                  <div className="absolute bottom-1/4 left-1/3 text-[10px] twinkle-star">★</div>
                </div>
              )}

              {proposal.theme.bgStyle === 'cinematic-dark' && (
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-black/30">
                  <div className="absolute -top-[45%] left-[5%] w-[80%] h-[140%] bg-gradient-to-b from-red-600/5 to-transparent rotate-[20deg] transform origin-top blur-3xl" />
                </div>
              )}

              {proposal.theme.bgStyle === 'sunset-orange' && (
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                  <div className="absolute top-[25%] left-[15%] w-72 h-72 bg-orange-500/15 rounded-full blur-3xl animate-pulse-slow" />
                </div>
              )}

              {proposal.theme.bgStyle === 'pastel-gold' && (
                <div className="absolute inset-4 pointer-events-none z-0 border border-[#d4af37]/15 rounded-lg" />
              )}

              {/* Wrapped Card element matching ProposalView */}
              <div className={`w-full max-w-[325px] p-6 relative space-y-5 flex flex-col justify-between min-h-[340px] text-center ${getThemeCardStyles()}`}>
                
                {/* Theme Card Decorations */}
                {proposal.theme.bgStyle === 'warm-cozy' && (
                  <>
                    <div className="absolute top-2 inset-x-0 flex justify-center gap-3.5 pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-slate-300 rounded-full border border-slate-900/10 shadow-inner" />
                      ))}
                    </div>
                    <div className="absolute left-8 top-0 bottom-0 w-[1.5px] bg-pink-400/40 pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.03)_1px,transparent_1px)] bg-[length:100%_26px] pointer-events-none pt-10" />
                  </>
                )}

                {proposal.theme.bgStyle === 'cinematic-dark' && (
                  <>
                    <div className="absolute inset-x-0 top-1.5 h-3 flex justify-between pointer-events-none px-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-1.5 h-2.5 bg-slate-950 rounded-sm border border-neutral-808" />
                      ))}
                    </div>
                    <div className="absolute inset-x-0 bottom-1.5 h-3 flex justify-between pointer-events-none px-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-1.5 h-2.5 bg-slate-950 rounded-sm border border-neutral-808" />
                      ))}
                    </div>
                    <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-950 rounded-full -translate-y-1/2 border-r border-neutral-850 z-10" />
                    <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-950 rounded-full -translate-y-1/2 border-l border-neutral-850 z-10" />
                  </>
                )}

                {proposal.theme.bgStyle === 'pastel-gold' && (
                  <>
                    <div className="absolute inset-2 border border-[#d4af37]/40 pointer-events-none" />
                    <div className="absolute inset-3 border border-[#d4af37]/20 pointer-events-none" />
                    <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-stone-50 px-2.5 py-0.5 text-[#d4af37] font-serif text-[10px] uppercase tracking-widest border border-[#d4af37]/20">
                      ✨ DateCraft ✨
                    </div>
                  </>
                )}

                {/* Section previews */}
                {activeSection === 'sec-hero' && (
                  <div className="space-y-4 max-w-xs z-10 my-auto">
                    <span className={`${getNoteStyle()} uppercase tracking-widest font-bold ${getThemeTextHighlight()} block`}>Hey {proposal.girlName || 'Lily'} ❤️</span>
                    <h2 className={`${getHeadingStyle()} tracking-tight leading-tight`}>{proposal.title || 'I made something special for you...'}</h2>
                    <p className={`${getBodyStyle()} text-slate-400 italic block`}>"{proposal.closingMessage}"</p>
                    <button className="mt-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full text-xs shadow-lg shadow-rose-500/20">
                      Open My Surprise ✨
                    </button>
                  </div>
                )}

                {activeSection === 'sec-proposal' && (
                  <div className="space-y-4 max-w-xs z-10 my-auto">
                    <h3 className={`${getSubheadingStyle()} leading-relaxed`}>Would you like to go on a date with me? 🌹</h3>
                    <div className="flex gap-4 justify-center mt-6">
                      <button className="px-5 py-2 bg-rose-600 text-white font-bold rounded-full text-xs">
                        Yes ❤️
                      </button>
                      <button className="px-5 py-2 bg-slate-900 border border-slate-800 text-slate-400 font-semibold rounded-full text-xs cursor-move">
                        No 🙈
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === 'sec-memories' && (
                  <div className="space-y-3 w-full text-left max-w-xs z-10 my-auto">
                    <h4 className={`text-center font-bold font-fantasy ${getSubheadingStyle()} mb-2`}>Our Memory Timeline</h4>
                    <div className="border-l border-rose-500 pl-4 space-y-3 text-xs max-h-[180px] overflow-y-auto pr-1">
                      {proposal.memories.slice(0, 2).map((mem, idx) => (
                        <div key={idx} className="relative space-y-0.5">
                          <span className="absolute -left-[20px] top-1 bg-rose-600 w-1.5 h-1.5 rounded-full" />
                          <p className={`font-bold text-rose-500 ${getNoteStyle()}`}>{mem.date}</p>
                          <h5 className="font-semibold">{mem.title}</h5>
                          <p className="text-slate-500 text-[10px] leading-normal">{mem.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'sec-polaroid' && (
                  <div className="space-y-3 max-w-xs z-10 my-auto">
                    <h4 className={`font-bold font-fantasy ${getSubheadingStyle()} mb-2`}>Polaroid Gallery</h4>
                    <div className="flex justify-center gap-4">
                      {proposal.memories.slice(0, 2).map((mem, idx) => (
                        <div 
                          key={idx}
                          className="bg-white p-2.5 pb-6 text-slate-955 shadow-xl border rounded transform max-w-[120px] mx-auto"
                          style={{ transform: `rotate(${idx === 0 ? '-3deg' : '3deg'})` }}
                        >
                          {mem.isScratchCard ? (
                            <div className="relative w-full h-20 overflow-hidden rounded bg-slate-400 flex items-center justify-center p-1 text-center select-none text-white border border-slate-300">
                              <span className="text-[8px] font-bold">Scratch Mask 🤫</span>
                            </div>
                          ) : mem.image ? (
                            <img 
                              src={mem.image} 
                              alt="Polaroid Preview" 
                              className="h-20 w-full object-cover border" 
                            />
                          ) : (
                            <div className="h-20 w-full bg-rose-50 flex items-center justify-center"><Heart className="h-4 w-4 text-rose-300" /></div>
                          )}
                          <p className="font-handwritten text-[10px] mt-1 text-center text-slate-700 font-bold leading-none truncate">
                            {mem.title || 'Day 1 💖'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'sec-envelope' && (
                  <div className="space-y-4 max-w-xs z-10 flex flex-col items-center my-auto w-full">
                    <h4 className={`font-bold font-fantasy ${getSubheadingStyle()}`}>Secret Love Envelope</h4>
                    {proposal.loveLetter?.envelopeSealType === 'wax_seal' ? (
                      <div className="relative w-20 h-20 flex items-center justify-center cursor-pointer select-none">
                        <div 
                          style={{ 
                            backgroundColor: proposal.loveLetter?.waxSealColor || '#b91c1c',
                            borderRadius: '43% 57% 48% 52% / 50% 45% 55% 50%',
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.35), 0 4px 8px rgba(0,0,0,0.45)'
                          }}
                          className="absolute inset-0 border border-white/10"
                        />
                        <div 
                          className="absolute w-12 h-12 rounded-full flex items-center justify-center text-white"
                          style={{ 
                            boxShadow: 'inset 0 0 6px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.2)',
                            border: '1px double rgba(255,255,255,0.2)'
                          }}
                        >
                          <Heart className="h-5 w-5 fill-white text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-14 bg-rose-600/20 border-2 border-rose-500 rounded-lg flex items-center justify-center cursor-pointer shadow-lg animate-pulse">
                        <span className="text-xl">✉️</span>
                      </div>
                    )}
                    <p className={`${getNoteStyle()} text-slate-500 italic mt-2`}>
                      {proposal.loveLetter?.envelopeSealType === 'wax_seal' ? 'Wax seal style envelope' : 'Tap envelope to slide out secret messages'}
                    </p>
                  </div>
                )}

                {activeSection === 'sec-compliments' && (
                  <div className="space-y-4 max-w-xs z-10 my-auto">
                    <h4 className={`font-bold font-fantasy ${getSubheadingStyle()}`}>Compliment Generator</h4>
                    <div className="p-4 bg-slate-900/60 border border-rose-500/20 rounded-2xl shadow-xl italic">
                      <p className={getBodyStyle()}>
                        "{proposal.compliments[0] || 'You look adorable reading this right now.'}"
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === 'sec-game' && (
                  <div className="space-y-3 max-w-xs z-10 text-center my-auto">
                    <h4 className={`font-bold font-fantasy ${getSubheadingStyle()}`}>Chemistry Check 🧪</h4>
                    <p className={`${getNoteStyle()} text-slate-500`}>Unlocks the RSVP scheduler!</p>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-left text-xs space-y-2">
                      <p className={`font-bold ${getBodyStyle()}`}>Q: {proposal.miniGames?.quizQuestions?.[0]?.question || 'What is my favorite nickname for you?'}</p>
                      <div className="space-y-1">
                        {(proposal.miniGames?.quizQuestions?.[0]?.options || ['Honey Bun 🍯', 'Princess 👑']).slice(0, 2).map((opt, idx) => (
                          <button key={idx} className="w-full text-left p-1 bg-slate-950 border border-slate-850 rounded text-[9px] text-slate-300">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'sec-invite' && (
                  <div className="space-y-3 max-w-xs z-10 text-center my-auto w-full flex flex-col items-center">
                    <h4 className={`font-bold font-fantasy ${getSubheadingStyle()}`}>Official Date Invitation</h4>
                    {proposal.miniGames?.enableSpinWheel ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-20 h-20 border-2 border-rose-500 rounded-full shadow-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                          <div className="w-full h-full relative rotate-[45deg]">
                            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#fecdd3] origin-bottom-left" />
                            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#ffe4e6] origin-top-left" />
                            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#fbcfe8] origin-top-right" />
                            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#fed7aa] origin-bottom-right" />
                          </div>
                          <div className="absolute w-2.5 h-2.5 rounded-full bg-rose-600 border border-white shadow-md z-25" />
                          <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-rose-600 z-30" />
                        </div>
                        <button className="px-2.5 py-0.5 bg-rose-600 text-white text-[8px] font-bold rounded-full shadow">
                          🎰 Decider Spinner Enabled
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-950 p-4 border border-rose-500/20 rounded-2xl text-xs space-y-1.5 shadow-xl text-left w-full">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Activity</p>
                        <p className="font-bold">Stargazing & Picnic 🌇✨</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">DateTime Choice</p>
                        <p className="font-bold">Pick your free date below</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Right Configuration Properties Panel */}
        <div className="w-96 border-l border-slate-900 bg-slate-950 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {activeSection === 'sec-hero' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white font-fantasy flex items-center gap-1"><FileText className="h-4 w-4 text-rose-500" /> Hero Page Config</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={proposal.girlName}
                      onChange={(e) => updateBasicField('girlName', e.target.value)}
                      className="w-full px-3 h-9 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nickname</label>
                    <input
                      type="text"
                      placeholder="e.g. My Princess"
                      value={proposal.nickname || ''}
                      onChange={(e) => updateBasicField('nickname', e.target.value)}
                      className="w-full px-3 h-9 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Surprise Title</label>
                    <input
                      type="text"
                      value={proposal.title}
                      onChange={(e) => updateBasicField('title', e.target.value)}
                      className="w-full px-3 h-9 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-sans">Intro Message</label>
                    <textarea
                      value={proposal.introMessage || ''}
                      onChange={(e) => updateBasicField('introMessage', e.target.value)}
                      className="w-full p-2 h-20 bg-slate-900 border border-slate-800 rounded-lg text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Closing Note Warning</label>
                    <input
                      type="text"
                      value={proposal.closingMessage || ''}
                      onChange={(e) => updateBasicField('closingMessage', e.target.value)}
                      className="w-full px-3 h-9 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'sec-proposal' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white font-fantasy flex items-center gap-1"><Heart className="h-4 w-4 text-rose-500 fill-rose-500" /> Proposal Question Protect</h3>
                
                <div className="space-y-3 bg-slate-900/30 p-3 rounded-2xl border border-slate-900">
                  <div className="text-xs">
                    <label className="text-slate-500 font-medium block mb-1">No Button Movement Action</label>
                    <select
                      value={proposal.noButtonBehavior.type}
                      onChange={(e) => updateNoBehaviorField('type', e.target.value)}
                      className="w-full h-8 bg-slate-950 border border-slate-800 rounded px-2 text-white"
                    >
                      <option value="moving">Moving Button (slides away on hover)</option>
                      <option value="shrinking">Shrinking (becomes smaller)</option>
                      <option value="disabled">Disabled (locked out click)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5">
                    <span className="text-slate-400 font-semibold">Eventually allow click on No?</span>
                    <button
                      onClick={() => updateNoBehaviorField('allowEventually', !proposal.noButtonBehavior.allowEventually)}
                      className={`w-7 h-4 rounded-full p-0.5 transition-colors ${proposal.noButtonBehavior.allowEventually ? 'bg-rose-600' : 'bg-slate-800'}`}
                    >
                      <div className={`h-3 w-3 rounded-full bg-white transition-transform ${proposal.noButtonBehavior.allowEventually ? 'transform translate-x-3' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'sec-memories' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-fantasy font-fantasy">Timeline Memories</h3>
                  <button
                    onClick={() => setProposal(prev => ({
                      ...prev,
                      memories: [...prev.memories, { title: 'New Memory', description: '', date: 'Today', image: '' }]
                    }))}
                    className="p-1 hover:bg-slate-900 border border-slate-800 rounded text-rose-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {proposal.memories.map((mem, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 space-y-2 text-xs relative">
                      <button
                        onClick={() => setProposal(prev => ({
                          ...prev,
                          memories: prev.memories.filter((_, mIdx) => mIdx !== idx)
                        }))}
                        className="absolute top-2 right-2 text-slate-500 hover:text-rose-455"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div>
                        <label className="text-slate-500">Date/Label</label>
                        <input
                          type="text"
                          value={mem.date}
                          onChange={(e) => {
                            const updated = [...proposal.memories];
                            updated[idx].date = e.target.value;
                            setProposal(prev => ({ ...prev, memories: updated }));
                          }}
                          className="w-full px-2 h-7 mt-0.5 bg-slate-950 border border-slate-800 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-500">Memory Title</label>
                        <input
                          type="text"
                          value={mem.title}
                          onChange={(e) => {
                            const updated = [...proposal.memories];
                            updated[idx].title = e.target.value;
                            setProposal(prev => ({ ...prev, memories: updated }));
                          }}
                          className="w-full px-2 h-7 mt-0.5 bg-slate-950 border border-slate-800 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-500 font-sans">Description</label>
                        <textarea
                          value={mem.description || ''}
                          onChange={(e) => {
                            const updated = [...proposal.memories];
                            updated[idx].description = e.target.value;
                            setProposal(prev => ({ ...prev, memories: updated }));
                          }}
                          className="w-full p-1.5 h-14 mt-0.5 bg-slate-950 border border-slate-800 rounded text-white resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-slate-500 block mb-1 font-sans">Upload Photo</label>
                        <div className="flex gap-2 items-center">
                          <label className="flex-1 flex items-center justify-center gap-1 px-3 h-8 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:bg-slate-900 text-[10px] text-slate-400">
                            <Image className="h-3.5 w-3.5" /> Upload File
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleFileUpload(e, 'memory', idx)} 
                              className="hidden" 
                            />
                          </label>
                          {mem.image && (
                            <img src={mem.image} alt="mem thumbnail" className="h-8 w-8 rounded object-cover border" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/40">
                        <span className="text-slate-400 font-semibold">Make this a Scratch Card? 🤫</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...proposal.memories];
                            updated[idx].isScratchCard = !updated[idx].isScratchCard;
                            setProposal(prev => ({ ...prev, memories: updated }));
                          }}
                          className={`w-7 h-4 rounded-full p-0.5 transition-colors ${mem.isScratchCard ? 'bg-rose-600' : 'bg-slate-800'}`}
                        >
                          <div className={`h-3 w-3 rounded-full bg-white transition-transform ${mem.isScratchCard ? 'transform translate-x-3' : ''}`} />
                        </button>
                      </div>

                      {mem.isScratchCard && (
                        <div>
                          <label className="text-slate-500">Scratch Coupon Reward Text</label>
                          <input
                            type="text"
                            placeholder="e.g. 1 Free Massage! 💆‍♂️"
                            value={mem.scratchCoupon || ''}
                            onChange={(e) => {
                              const updated = [...proposal.memories];
                              updated[idx].scratchCoupon = e.target.value;
                              setProposal(prev => ({ ...prev, memories: updated }));
                            }}
                            className="w-full px-2 h-7 mt-0.5 bg-slate-950 border border-slate-800 rounded text-white"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'sec-envelope' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-fantasy">Love Letter Settings</h3>
                  <button
                    onClick={() => triggerAiHelp('love_letter')}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-3 h-7 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" /> AI Love Letter
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Romantic Love Letter</label>
                    <textarea
                      value={proposal.loveLetter.letter || ''}
                      onChange={(e) => updateLoveLetterField('letter', e.target.value)}
                      className="w-full p-2 h-36 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Secret Message</label>
                    <input
                      type="text"
                      value={proposal.loveLetter.secretMessage || ''}
                      onChange={(e) => updateLoveLetterField('secretMessage', e.target.value)}
                      className="w-full px-3 h-9 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Future Promises/Plans</label>
                    <input
                      type="text"
                      value={proposal.loveLetter.futurePlans || ''}
                      onChange={(e) => updateLoveLetterField('futurePlans', e.target.value)}
                      className="w-full px-3 h-9 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                    />
                  </div>

                  <div className="bg-slate-900/30 p-3 rounded-2xl border border-slate-900 space-y-2.5">
                    <div className="text-xs">
                      <label className="text-slate-500 font-medium block mb-1">Envelope Seal Type</label>
                      <select
                        value={proposal.loveLetter.envelopeSealType || 'wax_seal'}
                        onChange={(e) => updateLoveLetterField('envelopeSealType', e.target.value)}
                        className="w-full h-8 bg-slate-950 border border-slate-800 rounded px-2 text-white"
                      >
                        <option value="wax_seal">Wax Seal Stamp 🕯️</option>
                        <option value="standard_stamp">Standard Post Stamp ✉️</option>
                        <option value="heart_sticker">Heart Sticker 💖</option>
                      </select>
                    </div>

                    {proposal.loveLetter.envelopeSealType === 'wax_seal' && (
                      <div className="text-xs">
                        <label className="text-slate-500 font-medium block mb-1">Wax Seal Stamp Color</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={proposal.loveLetter.waxSealColor || '#b91c1c'}
                            onChange={(e) => updateLoveLetterField('waxSealColor', e.target.value)}
                            className="w-8 h-8 bg-transparent border-0 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-400 font-mono uppercase">{proposal.loveLetter.waxSealColor || '#b91c1c'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'sec-compliments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-fantasy">Compliments Generator</h3>
                  <button
                    onClick={() => triggerAiHelp('compliment')}
                    className="inline-flex items-center gap-1.5 px-3 h-7 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" /> Add AI Compliment
                  </button>
                </div>

                <div className="space-y-2">
                  {proposal.compliments.map((comp, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={comp}
                        onChange={(e) => {
                          const updated = [...proposal.compliments];
                          updated[idx] = e.target.value;
                          setProposal(prev => ({ ...prev, compliments: updated }));
                        }}
                        className="flex-1 px-3 h-8 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                      />
                      <button
                        onClick={() => setProposal(prev => ({
                          ...prev,
                          compliments: prev.compliments.filter((_, cIdx) => cIdx !== idx)
                        }))}
                        className="p-1 hover:bg-slate-900 border border-slate-800 rounded text-slate-500 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'sec-game' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white font-fantasy flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-rose-500 animate-pulse" /> Chemistry Check Config 🧪
                </h3>
                
                <div className="space-y-4 bg-slate-900/30 p-4 rounded-2xl border border-slate-900 text-xs">
                  <p className="text-slate-500 leading-normal">
                    Create customized trivia questions to verify how well she knows you! Recipient must select the correct answer to proceed.
                  </p>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold text-[10px] uppercase">Trivia Question Text</label>
                      <input
                        type="text"
                        value={proposal.miniGames?.quizQuestions?.[0]?.question || 'What is my favorite nickname for you?'}
                        onChange={(e) => {
                          const updated = [...(proposal.miniGames?.quizQuestions || [])];
                          if (updated.length === 0) {
                            updated.push({ question: e.target.value, options: ['Honey Bun 🍯', 'Princess 👑', 'Gorgeous 🌹', 'Troublemaker 😈'], correctAnswer: 'Princess 👑' });
                          } else {
                            updated[0].question = e.target.value;
                          }
                          setProposal(prev => ({
                            ...prev,
                            miniGames: { ...prev.miniGames, quizQuestions: updated }
                          }));
                        }}
                        className="w-full px-3 h-9 bg-slate-900 border border-slate-850 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold text-[10px] uppercase">Answer Options (Comma-separated)</label>
                      <input
                        type="text"
                        value={proposal.miniGames?.quizQuestions?.[0]?.options?.join(', ') || 'Honey Bun 🍯, Princess 👑, Gorgeous 🌹, Troublemaker 😈'}
                        onChange={(e) => {
                          const list = e.target.value.split(',').map(s => s.trim());
                          const updated = [...(proposal.miniGames?.quizQuestions || [])];
                          if (updated.length === 0) {
                            updated.push({ question: 'What is my favorite nickname for you?', options: list, correctAnswer: list[0] });
                          } else {
                            updated[0].options = list;
                          }
                          setProposal(prev => ({
                            ...prev,
                            miniGames: { ...prev.miniGames, quizQuestions: updated }
                          }));
                        }}
                        className="w-full px-3 h-9 bg-slate-900 border border-slate-850 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold text-[10px] uppercase">Correct Answer Match (must match exactly)</label>
                      <input
                        type="text"
                        value={proposal.miniGames?.quizQuestions?.[0]?.correctAnswer || 'Princess 👑'}
                        onChange={(e) => {
                          const updated = [...(proposal.miniGames?.quizQuestions || [])];
                          if (updated.length === 0) {
                            updated.push({ question: 'What is my favorite nickname for you?', options: ['Honey Bun 🍯', 'Princess 👑'], correctAnswer: e.target.value });
                          } else {
                            updated[0].correctAnswer = e.target.value;
                          }
                          setProposal(prev => ({
                            ...prev,
                            miniGames: { ...prev.miniGames, quizQuestions: updated }
                          }));
                        }}
                        className="w-full px-3 h-9 bg-slate-900 border border-slate-850 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'sec-invite' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-fantasy">Interactive RSVP Questions</h3>
                </div>

                {/* Spin Wheel Configuration */}
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-200">Date Decider Spin Wheel 🎰</h4>
                      <p className="text-[10px] text-slate-500">Let recipient spin a wheel to choose date vibe!</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProposal(prev => ({
                          ...prev,
                          miniGames: {
                            ...prev.miniGames,
                            enableSpinWheel: !prev.miniGames?.enableSpinWheel
                          }
                        }));
                      }}
                      className={`w-7 h-4 rounded-full p-0.5 transition-colors ${proposal.miniGames?.enableSpinWheel ? 'bg-rose-600' : 'bg-slate-800'}`}
                    >
                      <div className={`h-3 w-3 rounded-full bg-white transition-transform ${proposal.miniGames?.enableSpinWheel ? 'transform translate-x-3' : ''}`} />
                    </button>
                  </div>

                  {proposal.miniGames?.enableSpinWheel && (
                    <div>
                      <label className="text-slate-500 block mb-1 font-semibold">Wheel Options (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Dinner 🕯️, Pizza 🍕, Coffee ☕, Movies 🍿"
                        value={proposal.miniGames?.spinWheelOptions?.join(', ') || ''}
                        onChange={(e) => {
                          const options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setProposal(prev => ({
                            ...prev,
                            miniGames: {
                              ...prev.miniGames,
                              spinWheelOptions: options
                            }
                          }));
                        }}
                        className="w-full px-2.5 h-8 bg-slate-950 border border-slate-850 rounded text-white text-[11px]"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {proposal.questions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 space-y-2 text-xs relative">
                      <button
                        onClick={() => setProposal(prev => ({
                          ...prev,
                          questions: prev.questions.filter((_, qIdx) => qIdx !== idx)
                        }))}
                        className="absolute top-2 right-2 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div>
                        <label className="text-slate-500">Question Text</label>
                        <input
                          type="text"
                          value={q.questionText}
                          onChange={(e) => {
                            const updated = [...proposal.questions];
                            updated[idx].questionText = e.target.value;
                            setProposal(prev => ({ ...prev, questions: updated }));
                          }}
                          className="w-full px-2 h-7 mt-0.5 bg-slate-950 border border-slate-800 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-500">Type</label>
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const updated = [...proposal.questions];
                            updated[idx].type = e.target.value;
                            setProposal(prev => ({ ...prev, questions: updated }));
                          }}
                          className="w-full h-7 mt-0.5 bg-slate-950 border border-slate-800 rounded text-white"
                        >
                          <option value="text">Text Entry</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="date_picker">Date Picker</option>
                          <option value="time_picker">Time Picker</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
