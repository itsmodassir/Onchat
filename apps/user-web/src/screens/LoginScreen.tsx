import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const setAuth = useStore(state => state.setAuth);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { email });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initialize handshake');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, otp });
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Security verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-indigo-600 shadow-2xl shadow-indigo-600/20 mb-8 transform hover:rotate-6 transition-transform">
            <ShieldCheck className="text-white w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">User Console</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Gateway Access</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-12 rounded-[3.5rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="space-y-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl animate-shake">
                {error}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Identity Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-bold"
                        placeholder="user@onchat.fun"
                        required
                      />
                    </div>
                 </div>
                 <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full premium-gradient text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  {loading ? 'Processing...' : 'Send Handshake OTP'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Verification Key</label>
                    <div className="relative group">
                      <CheckCircle2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-black tracking-[1em] text-center"
                        placeholder="••••••"
                        maxLength={6}
                        required
                      />
                    </div>
                 </div>
                 <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white text-slate-950 hover:bg-indigo-50 font-black py-5 rounded-2xl transition-all shadow-xl shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  {loading ? 'Verifying...' : 'Finalize Session'}
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-indigo-400 transition-colors"
                >
                  Correction? Re-send Email
                </button>
              </div>
            )}
          </form>
        </div>
        
        <p className="mt-10 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">
          Accessing Onchat Mainnet Protocol. Unauthorized entry is prohibited.
        </p>
      </div>
    </div>
  );
};
