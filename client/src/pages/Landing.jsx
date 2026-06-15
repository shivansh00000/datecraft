import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Heart, Sparkles, Wand2, Calendar, MessageCircle, BarChart2, ShieldCheck, ArrowRight, UserPlus, Gift, Star } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const faqs = [
    { q: "Do the recipients need to register an account?", a: "Absolutely not! Only proposal creators sign up. The recipient opens the unique link and enjoys the interactive experience seamlessly without logging in or installing anything." },
    { q: "Can I upload my own romantic background songs and photo cards?", a: "Yes, you can upload pictures, videos, voice recordings, and customized background songs to create a personalized experience." },
    { q: "What is the funny No button configuration?", a: "If you select this behavior, the 'No' button will jump, slide away, or shrink when hovered. It displays cute guilt-tripping messages like 'Free food is included!' or 'I built this whole website!' to gently steer them towards the 'Yes'." },
    { q: "Is the site responsive for mobile phones?", a: "DateCraft experiences are built mobile-first. They look and play like premium romantic story applications on all iOS and Android viewports." }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-rose-500/10 p-2 rounded-xl text-rose-500 border border-rose-500/20">
              <Heart className="h-6 w-6 fill-rose-500" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1 font-fantasy">
              DateCraft <span className="text-rose-500 font-sans">❤️</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-rose-400 transition-colors">Features</a>
            <a href="#templates" className="hover:text-rose-400 transition-colors">Themes</a>
            <a href="#how-it-works" className="hover:text-rose-400 transition-colors">How it Works</a>
            <a href="#faq" className="hover:text-rose-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link 
                to="/dashboard" 
                className="inline-flex items-center gap-1.5 px-4 h-10 text-sm font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 hover:opacity-90 transition-all"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-1.5 px-4 h-10 text-sm font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 hover:opacity-90 transition-all"
                >
                  Create Proposal <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/20 via-slate-950 to-slate-950 -z-10" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full mb-6">
            <Sparkles className="h-3 w-3" /> Turn Questions into Beautiful Memories
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Create Magical Date Proposals <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">
              They Can't Say No To.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Craft a personalized romantic website with memory galleries, love letters, custom interactive RSVP questions, mini-games, and a playful "No" button that slides away. Share it via a single romantic link.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 text-base font-bold rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Heart className="h-5 w-5 fill-white" /> Create Your Proposal
            </button>
            
            <a
              href="#templates"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 text-base font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              View Demo Themes
            </a>
          </div>

          {/* Interactive Floating Preview Card Mockup */}
          <div className="mt-16 max-w-4xl mx-auto relative rounded-2xl border border-slate-800 bg-slate-950/40 p-2 backdrop-blur-sm shadow-2xl">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
            <div className="rounded-xl overflow-hidden border border-slate-900 aspect-video bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-950 relative flex items-center justify-center">
              
              {/* Floating Hearts CSS Mock */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <span className="absolute animate-bounce text-xl left-10 top-1/4">❤️</span>
                <span className="absolute animate-pulse text-2xl right-16 top-1/3">🌸</span>
                <span className="absolute animate-bounce text-lg left-1/4 bottom-16">💖</span>
                <span className="absolute animate-pulse text-xl right-1/3 bottom-10">✨</span>
              </div>

              <div className="max-w-md text-center p-6 bg-slate-950/80 backdrop-blur-md border border-rose-500/20 rounded-2xl shadow-xl z-10 animate-float-slow">
                <p className="text-sm font-semibold text-rose-400 uppercase tracking-widest mb-2">Hey Lily ❤️</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Would you like to go on a romantic date with me? 🌹</h3>
                
                <div className="flex items-center justify-center gap-4">
                  <button className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 text-sm">
                    Yes ❤️
                  </button>
                  <button className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 font-semibold rounded-xl text-sm cursor-not-allowed">
                    No 🙈 (slides away!)
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4 font-fantasy">
              Features Built for True Romance 💖
            </h2>
            <p className="text-slate-400">
              Not just an RSVP form. A fully immersive visual walkthrough of your love timeline, secrets, games, and memories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-rose-500/20 transition-all group">
              <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500 border border-rose-500/20 w-fit mb-4">
                <Wand2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Canva-like Web Builder</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Add, remove, and drag-and-drop romantic sections: letter, timeline, custom questionnaire, and polaroid frame sheets. Updates preview in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-rose-500/20 transition-all group">
              <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500 border border-rose-500/20 w-fit mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">The Playful "No" Button</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Choose custom behaviors to dodge "No" clicks: slide away, shrink, jump coordinates, or show playful guilt messages until they tap Yes!
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-rose-500/20 transition-all group">
              <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500 border border-rose-500/20 w-fit mb-4">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Envelope & Mini-Games</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Add hidden heart hunts, quiz questions about your relationships, or a beautiful animated envelope that opens to reveal your letter.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-rose-500/20 transition-all group">
              <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500 border border-rose-500/20 w-fit mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Date Scheduler</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Allow them to pick their free dates, time slots, and activities. Generates a live countdown on approval and downloads a custom invite card.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-rose-500/20 transition-all group">
              <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500 border border-rose-500/20 w-fit mb-4">
                <BarChart2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real-time Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Get notified instantly on your phone when they open the page, view your gallery, complete questions, and select date times.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-rose-500/20 transition-all group">
              <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500 border border-rose-500/20 w-fit mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero-Auth for Recipients</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your partner never needs to log in, signup, or insert emails. They just enjoy the premium interactive experience in one simple click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase / Templates Section */}
      <section id="templates" className="py-24 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4 font-fantasy">
              Premium Romantic Themes 🌹✨
            </h2>
            <p className="text-slate-400">
              Pick from stunning, professionally designed theme templates matching your relationship\'s energy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Template Card 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-rose-500/30 transition-all group">
              <div className="h-44 bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center p-6 text-center text-white relative">
                <h4 className="text-2xl font-serif">🌹 Romantic Rose</h4>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-white mb-2">Romantic Rose</h3>
                <p className="text-slate-400 text-sm mb-4">Soft pink background, rose-red callouts, floating hearts, and classic serif layouts. A timeless favorite.</p>
                <div className="flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-rose-600"></span>
                  <span className="w-4 h-4 rounded-full bg-pink-200"></span>
                  <span className="w-4 h-4 rounded-full bg-pink-600"></span>
                </div>
              </div>
            </div>

            {/* Template Card 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-rose-500/30 transition-all group">
              <div className="h-44 bg-gradient-to-r from-indigo-900 to-slate-900 flex items-center justify-center p-6 text-center text-white relative">
                <h4 className="text-2xl font-fantasy text-amber-300">✨ Starry Night</h4>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-white mb-2">Starry Night</h3>
                <p className="text-slate-400 text-sm mb-4">Deep night blue skies, glowing amber stars, custom twinkling star click-reveals, and glowing fonts.</p>
                <div className="flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-600"></span>
                  <span className="w-4 h-4 rounded-full bg-indigo-950"></span>
                  <span className="w-4 h-4 rounded-full bg-amber-400"></span>
                </div>
              </div>
            </div>

            {/* Template Card 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-rose-500/30 transition-all group">
              <div className="h-44 bg-gradient-to-r from-amber-700 to-amber-100 flex items-center justify-center p-6 text-center text-amber-950 relative">
                <h4 className="text-2xl font-sans font-bold">☕ Coffee Date</h4>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-white mb-2">Coffee Date</h3>
                <p className="text-slate-400 text-sm mb-4">Warm amber tones, rounded soft card styles, and playful script fonts. Perfect for a cozy weekend invite.</p>
                <div className="flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-700"></span>
                  <span className="w-4 h-4 rounded-full bg-amber-100"></span>
                  <span className="w-4 h-4 rounded-full bg-orange-950"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12 font-fantasy">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-rose-400 fill-rose-400 flex-shrink-0" /> {faq.q}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-rose-600 text-rose-600" />
            <span className="font-fantasy font-bold text-slate-300">DateCraft © 2026</span>
          </div>
          <p className="text-center md:text-right">Made with love for romantic dates. Fully custom layouts.</p>
        </div>
      </footer>
    </div>
  );
}
