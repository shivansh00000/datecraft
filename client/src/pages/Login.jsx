import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Heart, Sparkles, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center relative px-4 overflow-hidden font-sans">
      
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Hearts CSS Mock */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <span className="absolute animate-bounce text-xl left-10 top-1/4">❤️</span>
        <span className="absolute animate-pulse text-2xl right-16 top-1/3 font-sans">💖</span>
        <span className="absolute animate-bounce text-lg left-1/3 bottom-20">🌹</span>
      </div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        
        {/* Glow border effect */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
        
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex bg-rose-500/10 p-2.5 rounded-2xl text-rose-500 border border-rose-500/20 mb-4 animate-float-medium">
            <Heart className="h-6 w-6 fill-rose-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back, Cupid!</h2>
          <p className="text-slate-400 text-sm mt-1.5">Sign in to edit your proposal pages and track responses.</p>
        </div>

        {error && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                placeholder="cupid@datecraft.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20 hover:opacity-90 active:scale-95 transition-all mt-6 cursor-pointer"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                Sign In <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6 font-sans">
          New to DateCraft?{' '}
          <Link to="/register" className="text-rose-400 hover:text-rose-300 font-semibold underline">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
}
