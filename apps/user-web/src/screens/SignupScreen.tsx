import { useState, useEffect } from 'react';
import { Mail, ArrowRight, User, Lock, Key, Target } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const AppLink = (Link as any);

export const SignupScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!email) {
      setError('Email Address is required to verify your identity.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // FIX: Changed 'type' to 'purpose' to match backend requirements
      await api.post('/auth/send-otp', { email, purpose: 'SIGNUP' });
      setCountdown(60);
      setSuccess('Verification code sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !otp) {
      setError('All fields are required to complete your registration.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/signup', { name, email, password, otp });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#020617] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[100px] rounded-full" />

      <div className="w-full max-w-xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
        {/* Brand */}
        <div className="text-center mb-12">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-600/30 mb-8 border border-white/10"
          >
            <Target className="text-white w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 text-white">Create Account</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Join Onchat Social Audio</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden border border-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <form onSubmit={handleSignup} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-bold"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-bold"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-bold"
                      placeholder="user@onchat.fun"
                    />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Verification Code</label>
                  <div className="flex gap-4">
                    <div className="relative group flex-1">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-black tracking-[0.5em]"
                        placeholder="••••••"
                        maxLength={6}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading || countdown > 0}
                      className="px-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      {countdown > 0 ? `${countdown}s` : 'Request'}
                    </button>
                  </div>
               </div>

               <button 
                type="submit" 
                disabled={loading}
                className="w-full premium-gradient text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-slate-600 text-[11px] font-bold mb-4 uppercase tracking-widest">Already have an account?</p>
            <AppLink 
              to="/login"
              className="inline-flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-[11px] hover:text-white transition-colors"
            >
              Sign In to your Dashboard
              <ArrowRight className="w-3 h-3" />
            </AppLink>
        </div>
      </div>
    </div>
  );
};
