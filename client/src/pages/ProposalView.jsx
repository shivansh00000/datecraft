import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Sparkles, Volume2, VolumeX, Mail, Calendar, Clock, Smile, 
  MapPin, Gift, Trophy, Star, Send, ArrowRight, ArrowLeft, Check, Compass, Play
} from 'lucide-react';

function ScratchCard({ image, couponText, onScratched }) {
  const canvasRef = useRef(null);
  const [scratched, setScratched] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Draw scratch cover (slate-400 silver texture)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text indicator
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch here! 🤫', canvas.width / 2, canvas.height / 2 - 5);
    ctx.font = '10px sans-serif';
    ctx.fillText('✨✨✨', canvas.width / 2, canvas.height / 2 + 15);
  }, []);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();

    // Check percent cleared
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentCount++;
    }
    const percent = (transparentCount / (pixels.length / 4)) * 100;
    if (percent > 45 && !scratched) {
      setScratched(true);
      if (onScratched) onScratched();
    }
  };

  const handleStart = (e) => {
    isDrawing.current = true;
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleMove = (e) => {
    if (!isDrawing.current) return;
    if (e.cancelable) e.preventDefault();
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

  return (
    <div className="relative w-full h-28 overflow-hidden rounded border border-slate-200 bg-slate-900 flex flex-col items-center justify-center p-2 text-center select-none">
      {/* Revealed Reward content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-rose-200">
        {image ? (
          <img src={image} className="w-full h-full object-cover rounded opacity-80" alt="secret" />
        ) : (
          <span className="text-3xl">🎁</span>
        )}
        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-1.5">
          <p className="text-rose-300 font-bold text-[10px] uppercase tracking-wide">Surprise Unlocked</p>
          <p className="text-white text-[11px] font-semibold leading-snug mt-0.5">{couponText || '1 Free Date Coupon!'}</p>
        </div>
      </div>

      {/* Canvas scratch mask */}
      {!scratched && (
        <canvas
          ref={canvasRef}
          width={150}
          height={112}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="absolute inset-0 w-full h-full z-10 cursor-crosshair touch-none"
        />
      )}
    </div>
  );
}

function SpinWheel({ options, onSelected }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    
    const optionsCount = options.length;
    const randomOptionIdx = Math.floor(Math.random() * optionsCount);
    const wedgeAngle = 360 / optionsCount;
    
    // Spin at least 5 full rotations (1800 degrees) plus target wedge offset
    const targetAngle = 1800 + (360 - (randomOptionIdx * wedgeAngle)) - (wedgeAngle / 2);
    setRotation(targetAngle);
    
    setTimeout(() => {
      setSpinning(false);
      const winOption = options[randomOptionIdx];
      setResult(winOption);
      if (onSelected) onSelected(winOption);
    }, 4000); // 4s match CSS transition
  };

  const colors = ['#fecdd3', '#ffe4e6', '#fbcfe8', '#fed7aa', '#ffedd5', '#fde047', '#a7f3d0', '#cffafe'];

  const radius = 100;
  const center = 100;
  const N = options.length;
  const angleStep = 360 / N;

  return (
    <div className="flex flex-col items-center gap-4 py-2 w-full max-w-[280px] mx-auto text-center">
      <div className="relative w-48 h-48 border-4 border-rose-500 rounded-full shadow-lg overflow-hidden bg-slate-950 flex items-center justify-center">
        {/* Wheel body */}
        <div 
          className="w-full h-full relative"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)' 
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {options.map((opt, idx) => {
              const startAngle = angleStep * idx - 90; // offset to align slices
              const endAngle = angleStep * (idx + 1) - 90;
              const midAngle = startAngle + angleStep / 2;

              const rad = (deg) => (deg * Math.PI) / 180;
              const x1 = center + radius * Math.cos(rad(startAngle));
              const y1 = center + radius * Math.sin(rad(startAngle));
              const x2 = center + radius * Math.cos(rad(endAngle));
              const y2 = center + radius * Math.sin(rad(endAngle));

              const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
              const color = colors[idx % colors.length];

              return (
                <g key={idx}>
                  {/* Wedge Path */}
                  <path 
                    d={pathData} 
                    fill={color} 
                    stroke="rgba(0,0,0,0.15)" 
                    strokeWidth="1"
                  />
                  {/* Option Text Label */}
                  <text
                    x={center + 32}
                    y={center}
                    transform={`rotate(${midAngle} ${center} ${center})`}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="fill-slate-800 font-extrabold text-[9px] tracking-tight pointer-events-none select-none"
                    style={{ fontStyle: 'normal' }}
                  >
                    {opt.length > 15 ? opt.substring(0, 13) + '..' : opt}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Central pin */}
        <div className="absolute w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-md z-20 flex items-center justify-center">
          <Heart className="h-3.5 w-3.5 fill-white text-white" />
        </div>
        
        {/* Pointer indicator */}
        <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-rose-600 z-30" />
      </div>

      {!result ? (
        <button 
          type="button"
          onClick={spin}
          disabled={spinning}
          className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-full shadow transition-all cursor-pointer hover:scale-[1.03] active:scale-95"
        >
          {spinning ? 'Choosing Vibe...' : '🎰 Spin to Decide date vibe!'}
        </button>
      ) : (
        <div className="animate-bounce text-xs font-bold text-rose-500">
          Vibe Decided: {result} 🎉
        </div>
      )}
    </div>
  );
}

export default function ProposalView() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [proposal, setProposal] = useState(null);
  
  // Recipient progress states
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  
  // Funny No button evade states
  const [noButtonClicks, setNoButtonClicks] = useState(0);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [noButtonSize, setNoButtonSize] = useState(1);
  const [noText, setNoText] = useState('No 🙈');

  // Mini Game Quiz States
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  
  // Questionnaire States
  const [formAnswers, setFormAnswers] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpCompleted, setRsvpCompleted] = useState(false);

  // Audio Music controls
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // Ambient Soundscapes
  const ambientAudioRef = useRef(null);
  const ambientAudioUrls = {
    rain: 'https://www.soundjay.com/nature/sounds/rain-07.mp3',
    fireplace: 'https://www.soundjay.com/nature/sounds/fire-1.mp3',
    waves: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3',
    lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  };

  // Wax Seal Stamp states
  const [sealCracking, setSealCracking] = useState(false);
  const [sealBroken, setSealBroken] = useState(false);

  // Spin Wheel Vibe state
  const [wheelVibe, setWheelVibe] = useState('');

  // Interactive secret envelope states
  const [envelopeOpened, setEnvelopeOpened] = useState(false);

  // Compliment generator active phrase
  const [activeCompliment, setActiveCompliment] = useState('');

  // Countdown timer target date
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Visitor tracking fingerprint
  const getVisitorId = () => {
    let vId = localStorage.getItem('dc_visitor_id');
    if (!vId) {
      vId = 'visitor-' + Math.random().toString(36).substring(2) + '-' + Date.now();
      localStorage.setItem('dc_visitor_id', vId);
    }
    return vId;
  };

  // Fetch proposal details
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/proposals/slug/${slug}`);
        if (res.data.success) {
          const prop = res.data.proposal;
          setProposal(prop);
          
          if (prop.compliments && prop.compliments.length > 0) {
            setActiveCompliment(prop.compliments[0]);
          }

          // Register Visit Analytics
          const visitorId = getVisitorId();
          const uaDetails = {
            browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari',
            device: window.innerWidth < 768 ? 'mobile' : 'desktop',
            country: 'Local Detect',
            os: navigator.userAgent.includes('Windows') ? 'Windows' : 'macOS'
          };

          await axios.post(`/api/analytics/proposal/${prop._id}/visit`, {
            visitorId,
            userAgent: uaDetails,
            source: document.referrer ? new URL(document.referrer).hostname : 'Direct'
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Proposal not found or archived.');
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [slug]);

  // Audio trigger helper
  const handleOpenSurprise = () => {
    setIsOpen(true);
    triggerHeartsFlow();
    
    // Play background audio
    if (proposal?.theme?.musicUrl && audioRef.current) {
      audioRef.current.play()
        .then(() => setAudioPlaying(true))
        .catch(err => console.log('Audio autoplay blocked by user interactions.'));
    }

    // Play ambient audio
    if (proposal?.theme?.ambientSound && proposal?.theme?.ambientSound !== 'none' && ambientAudioRef.current) {
      ambientAudioRef.current.play()
        .catch(err => console.log('Ambient autoplay blocked.'));
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
        if (ambientAudioRef.current) ambientAudioRef.current.pause();
        setAudioPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setAudioPlaying(true))
          .catch(err => console.log('Audio playback blocked.'));
        if (ambientAudioRef.current) {
          ambientAudioRef.current.play().catch(err => console.log('Ambient playback blocked.'));
        }
      }
    }
  };

  // Wax Seal Envelope breaking handler
  const handleBreakSeal = () => {
    if (sealCracking || sealBroken) return;
    setSealCracking(true);
    
    setTimeout(() => {
      setSealCracking(false);
      setSealBroken(true);
      setEnvelopeOpened(true);
      triggerHeartsFlow();
    }, 800);
  };

  // Confetti helper customized by confettiType
  const triggerHeartsFlow = () => {
    const type = proposal?.theme?.confettiType || 'hearts';
    let colors = ['#e11d48', '#f43f5e', '#fbcfe8']; // default hearts
    if (type === 'stars') {
      colors = ['#fbbf24', '#f59e0b', '#fb7185', '#38bdf8']; // gold stars & blues
    } else if (type === 'flowers') {
      colors = ['#fff1f2', '#ffe4e6', '#fbcfe8', '#f472b6']; // cherry blossom white/pink
    } else if (type === 'food') {
      colors = ['#b45309', '#f59e0b', '#fffbeb', '#78350f']; // cookies & lofi brown
    }

    confetti({
      particleCount: 85,
      spread: 65,
      origin: { y: 0.85 },
      colors
    });
  };

  // Confetti explosion on YES click
  const handleYes = async () => {
    setAccepted(true);
    triggerHeartsFlow();

    // post yes response to db
    try {
      await axios.post('/api/responses', {
        proposalId: proposal._id,
        visitorId: getVisitorId(),
        acceptanceStatus: 'yes'
      });
    } catch (err) {
      console.log('Error logging acceptance status');
    }
  };

  // Funny "No" evade buttons hover handler
  const handleNoHover = () => {
    const nextClicks = noButtonClicks + 1;
    setNoButtonClicks(nextClicks);

    const behavior = proposal?.noButtonBehavior || { type: 'moving', allowEventually: true, maxAttempts: 7 };
    
    // Cycle custom phrases
    const phrases = behavior.customPhrases || [
      'Are you sure? 🥺',
      'I already built a whole website for this! 😭',
      'Free food is included, you know! 🍕',
      'Okay, now this is getting personal 😔',
      'Is that your final answer? 💔',
      'Just click YES already! ❤️',
      'Okay, I will let you click No now... but please don\'t 🥺'
    ];
    
    setNoText(phrases[Math.min(nextClicks, phrases.length - 1)] || 'No 🙈');

    if (behavior.type === 'moving') {
      const range = typeof window !== 'undefined' && window.innerWidth < 768 ? 90 : 180;
      const x = (Math.random() - 0.5) * range;
      const y = (Math.random() - 0.5) * range;
      setNoButtonPos({ x, y });
    } else if (behavior.type === 'shrinking') {
      setNoButtonSize(Math.max(0.4, 1 - nextClicks * 0.1));
    }
  };

  // Compliments shuffle helper
  const nextCompliment = () => {
    if (!proposal?.compliments || proposal.compliments.length === 0) return;
    const shuffled = [...proposal.compliments].sort(() => 0.5 - Math.random());
    setActiveCompliment(shuffled[0]);
    triggerHeartsFlow();
  };

  // Submit Questionnaire RSVP Answers
  const handleSubmitRsvp = async (e) => {
    e.preventDefault();
    setSubmittingRsvp(true);
    
    try {
      const formattedAnswers = Object.entries(formAnswers).map(([qId, ans]) => {
        const matchingQ = proposal.questions.find(q => q.id === qId);
        return {
          questionId: qId,
          questionText: matchingQ ? matchingQ.questionText : 'Custom Q',
          answerText: ans
        };
      });

      const visitorId = getVisitorId();

      await axios.post('/api/responses', {
        proposalId: proposal._id,
        visitorId,
        answers: formattedAnswers,
        selectedDate,
        selectedTime,
        completionPercentage: 100
      });

      setRsvpCompleted(true);
      triggerHeartsFlow();
      
      setTimeout(() => {
        handleNextSlide();
      }, 1500);
    } catch (err) {
      console.error('Error submitting questionnaire answers:', err.message);
    } finally {
      setSubmittingRsvp(false);
    }
  };

  // Calculate live RSVP invitation timer countdown
  useEffect(() => {
    if (!selectedDate) return;

    const interval = setInterval(() => {
      const target = new Date(selectedDate);
      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(':');
        if (hours) target.setHours(parseInt(hours));
        if (minutes) target.setMinutes(parseInt(minutes));
      }
      
      const diff = target - new Date();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedDate, selectedTime]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-rose-500">
        <Heart className="h-10 w-10 animate-ping fill-rose-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400 p-6 text-center">
        <div className="space-y-4">
          <span className="text-4xl">🥺</span>
          <h2 className="text-xl font-bold text-white">Oops, link has expired or doesn't exist</h2>
          <p className="text-sm max-w-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Active theme properties config
  const theme = proposal.theme;
  
  // Custom font tokens matching CSS imports
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

  // CSS theme background mapping
  const bgClassMap = {
    'gradient-pink': 'theme-bg-gradient-pink',
    'starry-dark': 'theme-bg-starry-dark',
    'warm-cozy': 'theme-bg-warm-cozy',
    'cinematic-dark': 'theme-bg-cinematic-dark',
    'sunset-orange': 'theme-bg-sunset-orange',
    'pastel-gold': 'theme-bg-pastel-gold'
  };

  const bgStyleClass = bgClassMap[theme.bgStyle] || 'bg-slate-950';

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

  const getThemeButtonStyles = () => {
    switch (theme.bgStyle) {
      case 'gradient-pink':
        return 'bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg';
      case 'starry-dark':
        return 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10';
      case 'warm-cozy':
        return 'bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md';
      case 'cinematic-dark':
        return 'bg-red-600 hover:bg-red-500 text-white font-bold rounded-none uppercase tracking-wider';
      case 'sunset-orange':
        return 'bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg';
      case 'pastel-gold':
        return 'bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-none tracking-widest';
      default:
        return 'bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl';
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

  // Build floating sticker list for matching pookie romantic themes
  const getFloatingStickers = () => {
    switch (theme.bgStyle) {
      case 'gradient-pink': return ['🌹', '❤️', '🌸', '💖', '🧸', '🌹'];
      case 'starry-dark': return ['✨', '⭐', '💫', '🌙', '🌌', '✨'];
      case 'warm-cozy': return ['☕', '🧸', '🍪', '🧇', '🤎', '✨'];
      case 'cinematic-dark': return ['🎬', '🍿', '🎟️', '🍕', '🎥', '🎬'];
      case 'sunset-orange': return ['🌇', '🌅', '☀️', '🍊', '🧡', '✨'];
      case 'pastel-gold': return ['💎', '🥂', '🍾', '🤍', '✨', '💎'];
      default: return ['❤️', '✨', '🌸', '💖'];
    }
  };

  const stickers = getFloatingStickers();

  // Build active slides with safety check
  let activeSlides = [];
  if (proposal.sections && proposal.sections.length > 0) {
    activeSlides = proposal.sections.filter(s => s.enabled).sort((a, b) => a.order - b.order);
  }

  // Resilient fallback logic if sections details are empty
  if (activeSlides.length === 0) {
    activeSlides.push({ id: 'sec-hero', type: 'hero', enabled: true });
    activeSlides.push({ id: 'sec-proposal', type: 'proposal_question', enabled: true });
    if (proposal.memories && proposal.memories.length > 0) {
      activeSlides.push({ id: 'sec-memories', type: 'memory_timeline', enabled: true });
      activeSlides.push({ id: 'sec-polaroid', type: 'polaroid_gallery', enabled: true });
    }
    if (proposal.loveLetter && proposal.loveLetter.letter) {
      activeSlides.push({ id: 'sec-envelope', type: 'secret_envelope', enabled: true });
    }
    if (proposal.compliments && proposal.compliments.length > 0) {
      activeSlides.push({ id: 'sec-compliments', type: 'compliment_generator', enabled: true });
    }
    if (proposal.questions && proposal.questions.length > 0) {
      activeSlides.push({ id: 'sec-invite', type: 'final_invitation', enabled: true });
    }
  }

  const currentSlide = activeSlides[currentSlideIndex];

  const handleNextSlide = () => {
    if (currentSlideIndex < activeSlides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      triggerHeartsFlow();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  // Determine slide locks/progress restrictions
  const isSlideLocked = () => {
    if (!currentSlide) return false;
    
    // Lock Proposal slide until YES is pressed
    if (currentSlide.type === 'proposal_question' && !accepted) {
      return true;
    }
    
    // Lock Chemistry Check slide until Quiz is completed
    if (currentSlide.type === 'mini_game' && !quizCompleted) {
      return true;
    }

    // Lock RSVP Selector slide until RSVP is saved
    if (currentSlide.type === 'final_invitation' && !rsvpCompleted) {
      return true;
    }

    return false;
  };

  // Slide variant animations
  const slideVariants = {
    initial: { opacity: 0, x: 100, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 120 } },
    exit: { opacity: 0, x: -100, scale: 0.95, transition: { duration: 0.2 } }
  };

  // Compile Chemistry Check questions
  const quizQuestions = (proposal.miniGames?.quizQuestions && proposal.miniGames.quizQuestions.length > 0) 
    ? proposal.miniGames.quizQuestions 
    : [
        {
          question: 'What is my favorite sweet nickname for you?',
          options: ['Honey Bun 🍯', 'Princess 👑', 'Gorgeous 🌹', 'Troublemaker 😈'],
          correctAnswer: 'Princess 👑'
        }
      ];

  const currentQuizItem = quizQuestions[activeQuizIndex];

  const handleAnswerQuiz = (selectedOpt) => {
    const isCorrect = selectedOpt === currentQuizItem.correctAnswer;
    
    if (isCorrect) {
      triggerHeartsFlow();
      if (activeQuizIndex < quizQuestions.length - 1) {
        setActiveQuizIndex(prev => prev + 1);
      } else {
        setQuizCompleted(true);
      }
    } else {
      alert('Wrong answer 🙈 Think again! I know you know me better!');
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col justify-between overflow-hidden ${bgStyleClass} ${fontClass} p-4 md:p-6 z-10`}>
      
      {/* Hidden audio element */}
      {theme.musicUrl && (
        <audio ref={audioRef} src={theme.musicUrl} loop className="hidden" />
      )}

      {/* Hidden ambient audio element */}
      {theme.ambientSound && theme.ambientSound !== 'none' && ambientAudioUrls[theme.ambientSound] && (
        <audio ref={ambientAudioRef} src={ambientAudioUrls[theme.ambientSound]} loop className="hidden" />
      )}

      {/* Interactive premium theme backgrounds */}
      {theme.bgStyle === 'starry-dark' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Twinkling star points */}
          <div className="absolute top-[12%] left-[8%] w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute top-[28%] right-[15%] w-1.5 h-1.5 bg-amber-200 rounded-full twinkle-star" style={{ animationDelay: '0.4s' }} />
          <div className="absolute top-[42%] left-[28%] w-1 h-1 bg-indigo-200 rounded-full twinkle-star" style={{ animationDelay: '1.2s' }} />
          <div className="absolute bottom-[35%] right-[25%] w-1 h-1 bg-white rounded-full twinkle-star" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-[18%] left-[12%] w-1.5 h-1.5 bg-amber-100 rounded-full twinkle-star" style={{ animationDelay: '1.8s' }} />
          <div className="absolute top-[65%] right-[8%] w-1 h-1 bg-purple-300 rounded-full twinkle-star" style={{ animationDelay: '2.5s' }} />
          {/* Floating Crescent Moon */}
          <div className="absolute top-16 left-8 w-14 h-14 rounded-full bg-amber-100/5 shadow-[0_0_50px_rgba(253,230,138,0.15)] flex items-center justify-center text-3xl select-none opacity-80 animate-float-slow">🌙</div>
          {/* Shooting stars */}
          <div className="shooting-star" style={{ top: '20%', left: '5%', animationDelay: '1s' }} />
          <div className="shooting-star" style={{ top: '48%', left: '35%', animationDelay: '5s' }} />
        </div>
      )}

      {theme.bgStyle === 'gradient-pink' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[15%] left-[-15%] w-72 h-72 bg-pink-300/20 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-[12%] right-[-15%] w-80 h-80 bg-rose-300/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
        </div>
      )}

      {theme.bgStyle === 'warm-cozy' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.04] bg-[radial-gradient(#8b5a2b_1px,transparent_1px)] bg-[length:20px_20px]" />
      )}

      {theme.bgStyle === 'cinematic-dark' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-black/30">
          <div className="absolute -top-[40%] left-[5%] w-[80%] h-[140%] bg-gradient-to-b from-red-600/5 to-transparent rotate-[20deg] transform origin-top blur-3xl animate-pulse-slow" />
          <div className="absolute -top-[40%] right-[5%] w-[80%] h-[140%] bg-gradient-to-b from-red-600/5 to-transparent -rotate-[20deg] transform origin-top blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
        </div>
      )}

      {theme.bgStyle === 'sunset-orange' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[25%] left-[15%] w-80 h-80 bg-orange-500/15 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-[18%] right-[8%] w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2.5s' }} />
        </div>
      )}

      {theme.bgStyle === 'pastel-gold' && (
        <div className="absolute inset-4 pointer-events-none z-0 border border-[#d4af37]/15 rounded-lg" />
      )}

      {/* Floating sound toggle controls */}
      {isOpen && theme.musicUrl && (
        <button 
          onClick={toggleAudio}
          className="fixed top-6 right-6 z-50 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/10 text-white shadow-lg transition-all"
        >
          {audioPlaying ? <Volume2 className="h-4 w-4 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
        </button>
      )}

      {/* Adorable drifting sticker bubbles in viewport background */}
      {isOpen && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {stickers.map((emoji, idx) => (
            <motion.div
              key={idx}
              initial={{ y: '110vh', x: `${Math.random() * 90}%`, opacity: 0 }}
              animate={{ 
                y: '-10vh', 
                opacity: [0, 0.4, 0.4, 0],
                x: [`${Math.random() * 90}%`, `${Math.random() * 90}%`]
              }}
              transition={{ 
                duration: 12 + idx * 2, 
                repeat: Infinity, 
                ease: 'linear',
                delay: idx * 2.5
              }}
              className="absolute text-3xl select-none"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      )}

      {/* WELCOME SPLASH VIEW */}
      {!isOpen ? (
        <div className="flex-1 flex items-center justify-center p-4 z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md p-8 shadow-2xl relative text-center space-y-6 ${getThemeCardStyles()}`}
          >
            {/* Theme Card Decorations */}
            {theme.bgStyle === 'warm-cozy' && (
              <>
                <div className="absolute top-2 inset-x-0 flex justify-center gap-3.5 pointer-events-none">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 bg-slate-300 rounded-full border border-slate-900/10 shadow-inner" />
                  ))}
                </div>
                <div className="absolute left-8 top-0 bottom-0 w-[1.5px] bg-pink-400/40 pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.03)_1px,transparent_1px)] bg-[length:100%_26px] pointer-events-none pt-10" />
              </>
            )}

            {theme.bgStyle === 'cinematic-dark' && (
              <>
                <div className="absolute inset-x-0 top-1.5 h-3 flex justify-between pointer-events-none px-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-2 h-3 bg-slate-950 rounded-sm border border-neutral-805" />
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-1.5 h-3 flex justify-between pointer-events-none px-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="w-2 h-3 bg-slate-950 rounded-sm border border-neutral-805" />
                  ))}
                </div>
                <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-950 rounded-full -translate-y-1/2 border-r border-neutral-850 z-10" />
                <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-950 rounded-full -translate-y-1/2 border-l border-neutral-850 z-10" />
              </>
            )}

            {theme.bgStyle === 'pastel-gold' && (
              <>
                <div className="absolute inset-2 border border-[#d4af37]/40 pointer-events-none" />
                <div className="absolute inset-3 border border-[#d4af37]/20 pointer-events-none" />
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-stone-50 px-2.5 py-0.5 text-[#d4af37] font-serif text-[11px] uppercase tracking-widest border border-[#d4af37]/20">
                  ✨ DateCraft ✨
                </div>
              </>
            )}

            {theme.bgStyle !== 'pastel-gold' && theme.bgStyle !== 'warm-cozy' && theme.bgStyle !== 'cinematic-dark' && (
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
            )}
            
            <div className="inline-flex bg-rose-500/10 p-3.5 rounded-2xl text-rose-500 border border-rose-500/20 animate-bounce">
              <Heart className="h-6 w-6 fill-rose-500" />
            </div>

            <div className="space-y-2">
              <p className={`${getNoteStyle()} uppercase tracking-widest font-bold ${getThemeTextHighlight()}`}>Hey {proposal.girlName} ❤️</p>
              <h1 className={`${getHeadingStyle()} leading-tight`}>"{proposal.introMessage}"</h1>
            </div>

            <p className={`${getBodyStyle()} text-slate-400 italic`}>"{proposal.closingMessage}"</p>
            
            <button
              onClick={handleOpenSurprise}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 h-12 text-sm ${getThemeButtonStyles()} shadow-lg transition-all cursor-pointer`}
            >
              Open My Surprise ✨
            </button>
          </motion.div>
        </div>
      ) : (
        
        // DECK / SLIDESHOW VIEW
        <div className="flex-1 flex flex-col justify-between items-center z-10 max-w-md mx-auto w-full py-6">
          
          {/* Progress stepper bar */}
          <div className="w-full flex items-center justify-between px-2 mb-6 text-slate-400 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider">Slide {currentSlideIndex + 1} of {activeSlides.length}</span>
            <div className="flex gap-1.5 items-center">
              {activeSlides.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlideIndex 
                      ? 'w-5 bg-rose-500 shadow-md shadow-rose-500/50' 
                      : idx < currentSlideIndex ? 'w-2.5 bg-rose-600/60' : 'w-1.5 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Active Card Body Wrapper */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[380px] py-4">
            <AnimatePresence mode="wait">
              {currentSlide && (
                <motion.div
                  key={currentSlide.id}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`w-full p-6 md:p-8 relative space-y-6 flex flex-col justify-between min-h-[360px] ${getThemeCardStyles()}`}
                >
                  {/* Theme Card Decorations */}
                  {theme.bgStyle === 'warm-cozy' && (
                    <>
                      <div className="absolute top-2 inset-x-0 flex justify-center gap-3.5 pointer-events-none">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="w-2.5 h-2.5 bg-slate-300 rounded-full border border-slate-900/10 shadow-inner" />
                        ))}
                      </div>
                      <div className="absolute left-8 top-0 bottom-0 w-[1.5px] bg-pink-400/40 pointer-events-none" />
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.03)_1px,transparent_1px)] bg-[length:100%_26px] pointer-events-none pt-10" />
                    </>
                  )}

                  {theme.bgStyle === 'cinematic-dark' && (
                    <>
                      <div className="absolute inset-x-0 top-1.5 h-3 flex justify-between pointer-events-none px-4">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="w-2 h-3 bg-slate-950 rounded-sm border border-neutral-805" />
                        ))}
                      </div>
                      <div className="absolute inset-x-0 bottom-1.5 h-3 flex justify-between pointer-events-none px-4">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="w-2 h-3 bg-slate-950 rounded-sm border border-neutral-805" />
                        ))}
                      </div>
                      <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-950 rounded-full -translate-y-1/2 border-r border-neutral-850 z-10" />
                      <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-950 rounded-full -translate-y-1/2 border-l border-neutral-850 z-10" />
                    </>
                  )}

                  {theme.bgStyle === 'pastel-gold' && (
                    <>
                      <div className="absolute inset-2 border border-[#d4af37]/40 pointer-events-none" />
                      <div className="absolute inset-3 border border-[#d4af37]/20 pointer-events-none" />
                      <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-stone-50 px-2.5 py-0.5 text-[#d4af37] font-serif text-[11px] uppercase tracking-widest border border-[#d4af37]/20">
                        ✨ DateCraft ✨
                      </div>
                    </>
                  )}

                  {theme.bgStyle !== 'pastel-gold' && theme.bgStyle !== 'warm-cozy' && theme.bgStyle !== 'cinematic-dark' && (
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
                  )}

                  {/* SLIDE CARD 0: Hero Intro */}
                  {currentSlide?.type === 'hero' && (
                    <div className="space-y-6 text-center my-auto w-full py-4">
                      <div className="inline-flex bg-rose-500/10 p-4 rounded-full text-rose-500 border border-rose-500/20 animate-pulse">
                        <Heart className="h-8 w-8 fill-rose-500 text-rose-500" />
                      </div>
                      <div className="space-y-3">
                        <h3 className={`${getHeadingStyle()}`}>For {proposal.girlName} ❤️</h3>
                        <p className={`${getBodyStyle()} max-w-xs mx-auto text-center opacity-85`}>
                          {proposal.introMessage || 'I made something special for you...'}
                        </p>
                      </div>
                      <p className={`${getNoteStyle()} font-bold uppercase tracking-wider animate-pulse text-center ${getThemeTextHighlight()}`}>
                        Click Next to start our journey ✨
                      </p>
                    </div>
                  )}

                  {/* SLIDE CARD 1: Proposal main yes/no questions */}
                  {currentSlide?.type === 'proposal_question' && (
                    <div className="space-y-6 text-center my-auto">
                      <div className="inline-flex bg-rose-50/10 p-3 rounded-full text-rose-500 border border-rose-500/20">
                        <Heart className="h-6 w-6 fill-rose-500 animate-pulse" />
                      </div>

                      {accepted ? (
                        <div className="space-y-4 animate-float-medium text-center">
                          <span className="text-5xl block leading-none">YAYYYYY ❤️🎉</span>
                          <h3 className={`${getSubheadingStyle()}`}>You just made my day!</h3>
                          <p className={`${getBodyStyle()} max-w-xs mx-auto text-center opacity-85`}>
                            I'm so incredibly happy. Click next below to proceed through our timeline and RSVP details! 👇
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <h3 className={`${getHeadingStyle()} leading-relaxed`}>
                            Would you like to go on a date with me? 🌹
                          </h3>
                          
                          <div className="flex items-center justify-center gap-4 pt-4 relative min-h-[70px] w-full">
                            <button
                               onClick={handleYes}
                               className={`px-6 h-11 ${getThemeButtonStyles()} text-xs shadow-lg shadow-rose-500/25 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer z-20`}
                            >
                              Yes ❤️
                            </button>
                            
                            <button
                              onMouseEnter={handleNoHover}
                              onClick={handleNoHover}
                              style={{
                                transform: `translate(${noButtonPos.x}px, ${noButtonPos.y}px) scale(${noButtonSize})`,
                                transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
                              }}
                              className="px-5 h-10 bg-slate-950 border border-slate-855 hover:bg-slate-900 text-slate-400 font-semibold rounded-xl text-xs relative z-10"
                            >
                              {noText}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SLIDE CARD 2: Memories timeline */}
                  {currentSlide?.type === 'memory_timeline' && (
                    <div className="space-y-4 text-left my-auto w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-5 w-5 fill-rose-500 text-rose-500" />
                        <h3 className={`${getSubheadingStyle()} font-fantasy`}>Our Timeline Memories</h3>
                      </div>
                      
                      <div className="border-l-2 border-rose-500/30 pl-4 space-y-5 max-h-[240px] overflow-y-auto pr-1">
                        {proposal.memories.map((mem, idx) => (
                          <div key={idx} className="relative space-y-1">
                            <span className="absolute -left-[23px] top-0.5 bg-rose-600 w-2 h-2 rounded-full border-2 border-slate-900" />
                            <p className={`font-bold text-rose-500 uppercase ${getNoteStyle()}`}>{mem.date}</p>
                            <h4 className="font-semibold text-sm">{mem.title}</h4>
                            <p className={`opacity-75 leading-relaxed ${getBodyStyle()}`}>{mem.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SLIDE CARD 3: Polaroid hanging frames */}
                  {currentSlide?.type === 'polaroid_gallery' && (
                    <div className="space-y-4 text-center my-auto flex flex-col items-center">
                      <h3 className={`${getSubheadingStyle()} font-fantasy mb-2`}>Hanging Polaroid Frames</h3>
                      
                      <div className="flex flex-wrap justify-center gap-4">
                        {proposal.memories.slice(0, 2).map((mem, idx) => (
                          <div 
                            key={idx} 
                            className="bg-white p-2.5 pb-6 text-slate-955 shadow-xl border rounded transform hover:scale-105 transition-transform max-w-[150px]"
                            style={{ transform: `rotate(${idx === 0 ? '-3deg' : '3deg'})` }}
                          >
                            {mem.isScratchCard ? (
                              <ScratchCard 
                                image={mem.image}
                                couponText={mem.scratchCoupon}
                                onScratched={triggerHeartsFlow}
                              />
                            ) : mem.image ? (
                              <img src={mem.image} alt={mem.title} className="h-28 w-full object-cover border" />
                            ) : (
                              <div className="h-28 w-full bg-rose-50 flex items-center justify-center"><Heart className="h-6 w-6 text-rose-300" /></div>
                            )}
                            <p className="font-handwritten text-lg mt-1 text-center text-slate-700 font-bold leading-none">{mem.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SLIDE CARD 4: Secret envelope fold */}
                  {currentSlide?.type === 'secret_envelope' && (
                    <div className="space-y-4 text-center my-auto flex flex-col items-center w-full">
                      <h3 className={`${getSubheadingStyle()} font-fantasy`}>✉️ Secret Message Box</h3>
                      
                      {!envelopeOpened ? (
                        proposal.loveLetter?.envelopeSealType === 'wax_seal' ? (
                          <div className="w-full flex flex-col items-center gap-4 py-6">
                            <motion.div 
                              onClick={handleBreakSeal}
                              animate={sealCracking ? { 
                                scale: [1, 1.15, 0.95, 1.05, 1],
                                rotate: [0, 4, -4, 3, 0]
                              } : {}}
                              transition={{ duration: 0.6 }}
                              className="relative w-24 h-24 flex items-center justify-center cursor-pointer select-none group"
                            >
                              {/* Melted wax outline */}
                              <div 
                                style={{ 
                                  backgroundColor: proposal.loveLetter?.waxSealColor || '#b91c1c',
                                  borderRadius: '43% 57% 48% 52% / 50% 45% 55% 50%',
                                  boxShadow: 'inset 0 0 12px rgba(0,0,0,0.35), 0 5px 12px rgba(0,0,0,0.45)'
                                }}
                                className="absolute inset-0 transform group-hover:scale-105 transition-transform duration-300 border border-white/10"
                              />
                              {/* Inner stamp ring */}
                              <div 
                                className="absolute w-14 h-14 rounded-full flex items-center justify-center text-white"
                                style={{ 
                                  boxShadow: 'inset 0 0 8px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.2)',
                                  border: '2px double rgba(255,255,255,0.2)'
                                }}
                              >
                                <Heart className="h-6 w-6 fill-white text-white animate-pulse" />
                              </div>
                            </motion.div>
                            <span className={`${getNoteStyle()} font-bold uppercase tracking-wider animate-pulse ${getThemeTextHighlight()}`}>
                              Tap Wax Seal to Break Open
                            </span>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEnvelopeOpened(true);
                              triggerHeartsFlow();
                            }}
                            className="w-full py-8 bg-slate-950/40 border border-slate-800 hover:border-rose-500/25 rounded-2xl flex flex-col items-center gap-3 cursor-pointer shadow-lg animate-pulse"
                          >
                            <div className="w-16 h-12 bg-rose-600/10 border-2 border-rose-500 rounded-lg flex items-center justify-center text-2xl">
                              ✉️
                            </div>
                            <span className={`${getNoteStyle()} font-bold uppercase tracking-wider ${getThemeTextHighlight()}`}>Tap to open envelope</span>
                          </div>
                        )
                      ) : (
                        <div className="w-full bg-slate-950/20 p-4 border border-slate-800 rounded-2xl text-left space-y-3 relative animate-fadeIn max-h-[250px] overflow-y-auto">
                          <span className={`${getNoteStyle()} bg-rose-500/20 px-2 py-0.5 rounded absolute top-2 right-2 font-bold uppercase ${getThemeTextHighlight()}`}>Secret letter</span>
                          
                          <div className={`leading-relaxed space-y-3 whitespace-pre-wrap pt-3 opacity-95 ${getBodyStyle()}`}>
                            <p>{proposal.loveLetter?.letter}</p>
                            {proposal.loveLetter?.secretMessage && (
                              <p className="italic text-rose-400 bg-rose-950/20 p-2.5 rounded-xl border border-rose-950/10">"{proposal.loveLetter.secretMessage}"</p>
                            )}
                            {proposal.loveLetter?.futurePlans && (
                              <p className="opacity-75"><b>Future plans:</b> {proposal.loveLetter.futurePlans}</p>
                            )}
                          </div>
                          <button 
                            onClick={() => setEnvelopeOpened(false)}
                            className={`w-full text-center text-slate-500 hover:underline pt-2 font-semibold block ${getNoteStyle()}`}
                          >
                            Close Envelope
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SLIDE CARD 5: Compliments generator */}
                  {currentSlide?.type === 'compliment_generator' && (
                    <div className="space-y-4 text-center my-auto">
                      <div className="inline-flex bg-rose-500/10 p-2.5 rounded-full text-rose-500 border border-rose-500/20">
                        <Smile className="h-5 w-5" />
                      </div>
                      <h3 className={`${getSubheadingStyle()} font-fantasy`}>Compliment for You</h3>
                      
                      <div className={`p-4 bg-slate-950/30 border border-slate-800 rounded-2xl text-rose-400 italic min-h-[60px] flex items-center justify-center leading-relaxed ${getBodyStyle()}`}>
                        "{activeCompliment}"
                      </div>
                      
                      <button 
                        onClick={nextCompliment}
                        className={`px-4 py-2 bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600/20 rounded-xl font-bold transition-all cursor-pointer font-fantasy ${getNoteStyle()}`}
                      >
                        Generate another compliment ✨
                      </button>
                    </div>
                  )}

                  {/* SLIDE CARD 6: Chemistry Check Game */}
                  {currentSlide?.type === 'mini_game' && (
                    <div className="space-y-4 text-left my-auto w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        <h3 className={`${getSubheadingStyle()} font-fantasy`}>Chemistry Check 🧪</h3>
                      </div>

                      {quizCompleted ? (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-1">
                          <p className="font-bold text-green-400">Connection Verified! 💑</p>
                          <p className={`opacity-60 ${getNoteStyle()}`}>Date RSVP details unlocked. Click next to continue.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className={`font-semibold ${getBodyStyle()}`}>{currentQuizItem.question}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {currentQuizItem.options.map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleAnswerQuiz(opt)}
                                  className="p-2.5 border border-slate-800 rounded-xl text-left bg-slate-955/60 hover:border-rose-500 transition-colors text-slate-100 text-xs"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {quizQuestions.length > 1 && (
                            <p className={`text-slate-500 text-center font-sans ${getNoteStyle()}`}>Question {activeQuizIndex + 1} of {quizQuestions.length}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SLIDE CARD 7: Video Gallery */}
                  {currentSlide?.type === 'video_gallery' && (
                    <div className="space-y-4 text-center my-auto w-full">
                      <h3 className={`${getSubheadingStyle()} font-fantasy`}>Shared Video Memory</h3>
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
                        {proposal.media && proposal.media.find(m => m.type === 'video') ? (
                          <video src={proposal.media.find(m => m.type === 'video').url} controls className="w-full h-full" />
                        ) : (
                          <p className={`text-slate-500 ${getBodyStyle()}`}>No video uploaded yet.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SLIDE CARD 8: Voice Message */}
                  {currentSlide?.type === 'voice_message' && (
                    <div className="space-y-4 text-center my-auto w-full">
                      <h3 className={`${getSubheadingStyle()} font-fantasy`}>Voice Note for You 🎙️</h3>
                      <div className="p-4 bg-slate-955 border border-slate-850 rounded-2xl flex flex-col items-center gap-3">
                        {proposal.media && proposal.media.find(m => m.type === 'audio') ? (
                          <audio src={proposal.media.find(m => m.type === 'audio').url} controls className="w-full" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-500">
                            <span className="text-2xl">🎙️</span>
                            <p className={getBodyStyle()}>No voice recording left yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SLIDE CARD 9: RSVP questionnaire selection */}
                  {currentSlide?.type === 'final_invitation' && !rsvpCompleted && (
                    <div className="space-y-4 text-left my-auto w-full flex flex-col items-center justify-center">
                      <h3 className={`${getSubheadingStyle()} flex items-center gap-1.5 font-fantasy w-full text-center justify-center`}><Calendar className="h-4.5 w-4.5 text-rose-500" /> Confirm Date Invitation</h3>
                      
                      {proposal.miniGames?.enableSpinWheel && !wheelVibe ? (
                        <div className="flex flex-col items-center w-full">
                          <p className={`text-slate-400 text-center mb-1 ${getNoteStyle()}`}>Spin the wheel to decide our date vibe! 🎰</p>
                          <SpinWheel 
                            options={proposal.miniGames.spinWheelOptions?.length > 0 ? proposal.miniGames.spinWheelOptions : ['Movie Night 🍿', 'Picnic 🧺', 'Fancy Dinner 🕯️', 'Stargazing ✨', 'Cozy Cafe ☕', 'Game Night 🎮']} 
                            onSelected={(vibe) => {
                              setWheelVibe(vibe);
                              const updatedAnswers = { 'q-vibe': vibe };
                              proposal.questions.forEach(q => {
                                if (q.questionText.toLowerCase().includes('vibe') || q.questionText.toLowerCase().includes('activity') || q.questionText.toLowerCase().includes('decide')) {
                                  updatedAnswers[q.id] = vibe;
                                }
                              });
                              setFormAnswers(prev => ({ ...prev, ...updatedAnswers }));
                            }} 
                          />
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitRsvp} className="space-y-3 w-full max-h-[240px] overflow-y-auto pr-1">
                          {proposal.miniGames?.enableSpinWheel && wheelVibe && (
                            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-xs font-semibold text-rose-400 mb-2">
                              🎰 Decided Vibe: {wheelVibe}
                            </div>
                          )}

                          {proposal.questions.map((q) => (
                            <div key={q.id} className="space-y-1">
                              <label className={`block text-slate-400 font-semibold ${getNoteStyle()}`}>{q.questionText}</label>
                              
                              {q.type === 'text' && (
                                <input
                                  type="text"
                                  required={q.required}
                                  placeholder="Type response..."
                                  value={formAnswers[q.id] || ''}
                                  onChange={(e) => setFormAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                  className="w-full px-3 h-8 bg-slate-950 border border-slate-855 rounded-xl text-white focus:outline-none text-xs"
                                />
                              )}

                              {q.type === 'multiple_choice' && (
                                <div className="grid grid-cols-2 gap-2">
                                  {q.options.map(opt => (
                                    <button
                                      type="button"
                                      key={opt}
                                      onClick={() => setFormAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                      className={`p-2 border rounded-xl text-left text-[11px] transition-colors ${
                                        formAnswers[q.id] === opt 
                                          ? 'bg-rose-500/10 border-rose-500 text-rose-400 font-semibold' 
                                          : 'bg-slate-950 border-slate-855 text-slate-400'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {q.type === 'date_picker' && (
                                <input
                                  type="date"
                                  required={q.required}
                                  value={selectedDate}
                                  onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setFormAnswers(prev => ({ ...prev, [q.id]: e.target.value }));
                                  }}
                                  className="w-full px-3 h-8 bg-slate-950 border border-slate-855 rounded-xl text-white focus:outline-none text-xs"
                                />
                              )}

                              {q.type === 'time_picker' && (
                                <input
                                  type="time"
                                  required={q.required}
                                  value={selectedTime}
                                  onChange={(e) => {
                                    setSelectedTime(e.target.value);
                                    setFormAnswers(prev => ({ ...prev, [q.id]: e.target.value }));
                                  }}
                                  className="w-full px-3 h-8 bg-slate-950 border border-slate-855 rounded-xl text-white focus:outline-none text-xs"
                                />
                              )}
                            </div>
                          ))}

                          <button
                            type="submit"
                            disabled={submittingRsvp}
                            className={`w-full h-9 ${getThemeButtonStyles()} mt-4 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs`}
                          >
                            {submittingRsvp ? 'Saving Date...' : 'Save Invitation 📅'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* SLIDE CARD 10: Final RSVP Countdown details */}
                  {currentSlide?.type === 'final_invitation' && rsvpCompleted && (
                    <div className="space-y-5 text-center my-auto w-full">
                      <div className="inline-flex bg-green-500/10 p-2.5 rounded-full text-green-400 border border-green-500/20">
                        <Check className="h-5 w-5" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className={`${getSubheadingStyle()} font-fantasy`}>Our Date is Confirmed! ❤️</h3>
                        <p className={`text-slate-400 ${getNoteStyle()}`}>Everything has been saved. See you then!</p>
                      </div>

                      <div className={`bg-slate-950/20 border border-slate-800 p-3.5 rounded-2xl text-left space-y-1.5 max-w-xs mx-auto ${getBodyStyle()}`}>
                        <p className="text-slate-500">Vibe Choice: <b className="text-rose-400">{formAnswers['q-vibe'] || 'Romantic Date'}</b></p>
                        <p className="text-slate-500">Selected Day: <b className="text-rose-400">{new Date(selectedDate).toLocaleDateString()}</b></p>
                        <p className="text-slate-500">Selected Time: <b className="text-rose-400">{selectedTime || 'Anytime'}</b></p>
                      </div>

                      {/* Live countdown timer widget */}
                      {selectedDate && (
                        <div className="space-y-1.5 pt-1">
                          <p className={`uppercase tracking-wider text-rose-500 font-bold ${getNoteStyle()}`}>Countdown Clock</p>
                          <div className="grid grid-cols-4 gap-2 text-center max-w-xs mx-auto text-slate-50">
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-md">
                              <span className="text-sm font-bold block leading-none">{countdown.days}</span>
                              <span className="text-[8px] text-slate-500 block uppercase mt-0.5">Days</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-md">
                              <span className="text-sm font-bold block leading-none">{countdown.hours}</span>
                              <span className="text-[8px] text-slate-500 block uppercase mt-0.5">Hrs</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-md">
                              <span className="text-sm font-bold block leading-none">{countdown.minutes}</span>
                              <span className="text-[8px] text-slate-500 block uppercase mt-0.5">Mins</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-md">
                              <span className="text-sm font-bold block leading-none">{countdown.seconds}</span>
                              <span className="text-[8px] text-slate-500 block uppercase mt-0.5">Secs</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom navigation slide buttons */}
          <div className="w-full flex items-center justify-between px-2 mt-6">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className={`inline-flex items-center gap-1.5 px-4 h-10 text-xs font-semibold rounded-xl border transition-colors ${
                currentSlideIndex === 0 
                  ? 'border-slate-900 text-slate-600 cursor-not-allowed opacity-40' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>

            <button
              onClick={handleNextSlide}
              disabled={isSlideLocked() || currentSlideIndex === activeSlides.length - 1}
              className={`inline-flex items-center gap-1.5 px-5 h-10 text-xs font-bold rounded-xl shadow-lg transition-all ${
                isSlideLocked() || currentSlideIndex === activeSlides.length - 1
                  ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-40 shadow-none'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-95'
              }`}
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
