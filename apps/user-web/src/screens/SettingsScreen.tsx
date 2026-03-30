import { useState } from 'react';
import { 
  ChevronLeft, User, FileText, Mail, Bell, 
  Volume2, Lock, ShieldCheck, Info, LogOut, 
  ChevronRight, Pencil, Trash2,
  Globe
} from 'lucide-react';
import { useStore } from '../store';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsScreen = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useStore();

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState('');

  const handleEdit = (field: string, current: string) => {
    setEditField(field);
    setFieldValue(current);
  };

  const saveField = async () => {
    if (!editField) return;
    setSaving(true);
    try {
      const response = await api.put('/auth/profile', {
        [editField]: fieldValue,
      });
      setUser(response.data);
      setEditField(null);
    } catch (error) {
      alert('Failed to synchronize profile delta.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Terminate current session and de-authorize terminal?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Header */}
      <div className="flex items-center gap-6">
         <button 
           onClick={() => navigate(-1)}
           className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
         >
            <ChevronLeft className="w-6 h-6" />
         </button>
         <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-1 uppercase tracking-tighter">Terminal Settings</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
               <ShieldCheck className="w-3 h-3 text-indigo-400" />
               Identity & Environment Calibration
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
         {/* Profile Preview Sidebar */}
         <aside className="space-y-8">
            <div className="glass-card p-8 rounded-[3rem] border border-white/5 text-center space-y-6">
               <div className="relative inline-block group">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-[30px] rounded-full group-hover:bg-indigo-500/40 transition-colors" />
                  <img 
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} 
                    className="w-32 h-32 rounded-[3rem] border-4 border-[#020617] relative z-10"
                    alt="Avatar"
                  />
                  <button className="absolute bottom-0 right-0 w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center border-4 border-[#020617] z-20 hover:scale-110 transition-transform">
                     <Pencil className="w-4 h-4" />
                  </button>
               </div>
               <div>
                  <h2 className="text-xl font-black text-white">{user?.name || 'Identity Pending'}</h2>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">UID: {user?.shortId || 'UNAUTHORIZED'}</p>
               </div>
               <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                     <span className="text-slate-500">Integrity Status</span>
                     <span className="text-emerald-500">Optimized</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                     <div className="w-[95%] h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                  </div>
               </div>
            </div>

            <button 
               onClick={handleLogout}
               className="w-full py-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3"
            >
               <LogOut className="w-4 h-4" />
               De-Authorize Session
            </button>
         </aside>

         {/* Settings Main */}
         <main className="md:col-span-2 space-y-10">
            {/* Identity Settings */}
            <section className="space-y-6">
               <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Identity Configuration</h3>
               <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                  <SettingRow 
                     icon={User} 
                     label="Identity Name" 
                     value={user?.name || 'Unset Identity'} 
                     onEdit={() => handleEdit('name', user?.name || '')}
                  />
                  <SettingRow 
                     icon={FileText} 
                     label="Identity Bio" 
                     value={user?.bio || 'No status established'} 
                     onEdit={() => handleEdit('bio', user?.bio || '')}
                  />
                  <SettingRow 
                     icon={Mail} 
                     label="Primary Vector (Email)" 
                     value={user?.email || 'identity@unresolved.network'} 
                  />
               </div>
            </section>

            {/* Neural Preferences */}
            <section className="space-y-6">
               <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Neural Preferences</h3>
               <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                  <ToggleRow 
                     icon={Bell} 
                     label="Push Intercepts" 
                     enabled={notifEnabled} 
                     onToggle={() => setNotifEnabled(!notifEnabled)} 
                  />
                  <ToggleRow 
                     icon={Volume2} 
                     label="Audio Resonance" 
                     enabled={soundEnabled} 
                     onToggle={() => setSoundEnabled(!soundEnabled)} 
                  />
                  <SettingRow 
                     icon={Globe} 
                     label="Terminal Dialect" 
                     value="English (Standard)" 
                  />
               </div>
            </section>

            {/* Security & System */}
            <section className="space-y-6">
               <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Security & System</h3>
               <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                  <SettingRow 
                     icon={Lock} 
                     label="Encryption Keys (Password)" 
                     onClick={() => navigate('/forgot-password')} 
                     hasArrow
                  />
                  <SettingRow 
                     icon={ShieldCheck} 
                     label="Privacy Protocols" 
                     hasArrow
                  />
                  <SettingRow 
                     icon={Info} 
                     label="Build Manifest" 
                     value="v1.0.4-stable" 
                  />
                  <SettingRow 
                     icon={Trash2} 
                     label="Purge Local Cache" 
                     className="text-rose-400"
                  />
               </div>
            </section>
         </main>
      </div>

      {/* Edit Modal / Overlay */}
      <AnimatePresence>
         {editField && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setEditField(null)}
                 className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
              />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-lg glass-card p-12 rounded-[3.5rem] border-white/10 shadow-[0_0_100px_rgba(79,70,229,0.1)] space-y-8"
              >
                 <div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">Edit Identity Delta</h4>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2 px-1 border-l-2 border-indigo-500">Modifying: {editField}</p>
                 </div>

                 <div className="space-y-2">
                    <input 
                       type="text"
                       value={fieldValue}
                       onChange={(e) => setFieldValue(e.target.value)}
                       autoFocus
                       className="w-full bg-slate-900 border border-white/10 rounded-2xl py-6 px-8 text-lg font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                 </div>

                 <div className="flex gap-4">
                    <button 
                       onClick={() => setEditField(null)}
                       className="flex-1 py-5 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={saveField}
                       disabled={saving}
                       className="flex-1 py-5 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                    >
                       {saving ? 'Synchronizing...' : 'Establish Change'}
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};

const SettingRow = ({ icon: Icon, label, value, onClick, onEdit, hasArrow, className }: any) => (
   <div 
      onClick={onEdit || onClick}
      className={`flex items-center gap-6 p-6 hover:bg-white/5 transition-colors cursor-pointer group px-8 ${className}`}
   >
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
         <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">{label}</p>
         <p className="text-sm font-bold text-white">{value}</p>
      </div>
      {onEdit && (
         <Pencil className="w-4 h-4 text-slate-700 group-hover:text-indigo-500 transition-colors" />
      )}
      {hasArrow && (
         <ChevronRight className="w-5 h-5 text-slate-800 group-hover:text-white transition-all" />
      )}
   </div>
);

const ToggleRow = ({ icon: Icon, label, enabled, onToggle }: any) => (
   <div className="flex items-center gap-6 p-6 px-8">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${enabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
         <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
         <p className="text-sm font-bold text-white">{label}</p>
      </div>
      <button 
         onClick={onToggle}
         className={`w-14 h-8 rounded-full transition-colors relative ${enabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
      >
         <motion.div 
            animate={{ x: enabled ? 26 : 4 }}
            className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
         />
      </button>
   </div>
);
