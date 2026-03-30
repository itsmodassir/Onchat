import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2, Lock, Eye, EyeOff, Key } from 'lucide-react';
import { useStore } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const AppLink = (Link as any);

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email/Password, 2: OTP (if in OTP mode)
  const [loginMode, setLoginMode] = useState<'otp' | 'password'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const setAuth = useStore(state => state.setAuth);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Email Address is required');
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { email, purpose: 'LOGIN' });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: any = { email };
      if (loginMode === 'otp') {
        payload.otp = otp;
      } else {
        payload.password = password;
      }

      const res = await api.post('/auth/login', payload);
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#020617] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[100px] rounded-full" />

      <div className="w-full max-md relative z-10 animate-in fade-in zoom-in-95 duration-500 max-w-md">
        {/* Brand */}
        <div className="text-center mb-12">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-indigo-600 shadow-2xl shadow-indigo-600/20 mb-8 transform transition-transform border border-white/10"
          >
            <ShieldCheck className="text-white w-12 h-12" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 text-white">Sign In</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Access your Onchat Account</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden border border-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <form onSubmit={loginMode === 'otp' && step === 1 ? handleSendOTP : handleLogin} className="space-y-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
               {/* Email Field - Always visible if step 1 or password mode */}
               {(step === 1 || loginMode === 'password') && (
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-bold"
                        placeholder="user@onchat.fun"
                        required
                      />
                    </div>
                 </div>
               )}

               <AnimatePresence mode="wait">
                {loginMode === 'password' ? (
                   <motion.div 
                    key="password-field"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-16 pr-14 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-bold"
                        placeholder="••••••••"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                ) : step === 2 && (
                  <motion.div 
                    key="otp-field"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Verification Code</label>
                    <div className="relative group">
                      <CheckCircle2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-black tracking-[1em] text-center text-white"
                        placeholder="••••••"
                        maxLength={6}
                        required
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-indigo-400 transition-colors mt-2"
                    >
                      Wrong Email? Go Back
                    </button>
                  </motion.div>
                )}
               </AnimatePresence>

               {/* Mode Toggle */}
               {step === 1 && (
                 <button 
                    type="button"
                    onClick={() => setLoginMode(loginMode === 'password' ? 'otp' : 'password')}
                    className="w-full text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {loginMode === 'password' ? <Key className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    Use {loginMode === 'password' ? 'OTP verification' : 'Password'} instead
                  </button>
               )}

               <button 
                type="submit" 
                disabled={loading}
                className="w-full premium-gradient text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                {loading ? 'Authenticating...' : (loginMode === 'otp' && step === 1 ? 'Send Login OTP' : 'Sign In')}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-12 text-center space-y-6">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">
              Standard Access Protocol. Authorized Entry only.
            </p>
            <div className="flex items-center justify-center gap-4">
               <AppLink to="/signup" className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest underline decoration-white/10 underline-offset-8">Create Account</AppLink>
               <div className="w-1 h-1 rounded-full bg-slate-800" />
               <AppLink to="/forgot-password" className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest underline decoration-white/10 underline-offset-8">Forgot Password?</AppLink>
            </div>
        </div>
      </div>
    </div>
  );
};
