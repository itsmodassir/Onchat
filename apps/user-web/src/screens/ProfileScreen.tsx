
import { useStore } from '../store';
import { 
  User as UserIcon, 
  Shield, 
  Award, 
  Crown, 
  ChevronRight, 
  Mail, 
  Calendar,
  Settings,
  Heart
} from 'lucide-react';

export const ProfileScreen = () => {
  const { user } = useStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12">
        <div className="glass-card p-16 rounded-[4rem] text-center max-w-md">
          <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <UserIcon className="w-10 h-10 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-black mb-4">Identity Not Found</h2>
          <p className="text-slate-500 font-medium mb-8">Please establish a secure session to view your identity console.</p>
          <button className="w-full premium-gradient py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Initialize Login</button>
        </div>
      </div>
    );
  }

  const level = Math.floor(user.coins / 1000) + 1;
  const progress = (user.coins % 1000) / 10;

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-700">
      {/* Profile Header */}
      <section className="relative">
        <div className="h-64 rounded-[3rem] overflow-hidden">
           <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-40" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
        </div>
        
        <div className="absolute -bottom-16 left-16 flex items-end gap-10">
           <div className="relative">
              <div className="w-44 h-44 rounded-[3.5rem] overflow-hidden border-8 border-[#020617] shadow-2xl">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.shortId}`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-indigo-600 rounded-3xl border-4 border-[#020617] flex items-center justify-center shadow-xl">
                 <Shield className="text-white w-6 h-6" />
              </div>
           </div>
           
           <div className="pb-6">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-5xl font-black tracking-tighter">{user.name}</h1>
                <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                  Level {level}
                </div>
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">@{user.shortId.toUpperCase()}</p>
           </div>
        </div>
      </section>

      {/* Grid Content */}
      <div className="pt-20 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Stats & Progress */}
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-card p-12 rounded-[3.5rem] space-y-10">
             <div className="flex justify-between items-center border-b border-white/5 pb-8">
                <h3 className="text-xl font-black">Experience Flux</h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.coins % 1000} / 1000 XP</span>
             </div>
             <div className="space-y-4">
                <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                   <div 
                    className="h-full premium-gradient shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-1000" 
                    style={{ width: `${progress}%` }} 
                   />
                </div>
                <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-widest">
                  {1000 - (user.coins % 1000)} Coins until Level {level + 1}
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="glass-card p-10 rounded-[3rem] border-l-4 border-l-purple-500 group hover:bg-white/5 transition-all">
               <div className="flex justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                    <Crown className="text-purple-500 w-6 h-6" />
                  </div>
                  <ChevronRight className="text-slate-700 group-hover:text-slate-400 transition-colors" />
               </div>
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Tier</h4>
               <p className="text-2xl font-black">Aristocracy_v1</p>
            </div>
            
            <div className="glass-card p-10 rounded-[3rem] border-l-4 border-l-amber-500 group hover:bg-white/5 transition-all">
               <div className="flex justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Award className="text-amber-500 w-6 h-6" />
                  </div>
                  <ChevronRight className="text-slate-700 group-hover:text-slate-400 transition-colors" />
               </div>
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Achievement Medals</h4>
               <p className="text-2xl font-black">12 Unlocked</p>
            </div>
          </div>

          {/* Activity Section */}
          <div className="glass-card p-12 rounded-[3.5rem]">
             <h3 className="text-xl font-black mb-10">Social Pulse</h3>
             <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
                      <Heart className="text-indigo-500 w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-black">Joined Midnight Chill Lounge</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">2 hours ago</p>
                    </div>
                    <ChevronRight className="ml-auto text-slate-700 w-5 h-5" />
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Identity Details */}
        <div className="space-y-10">
          <div className="glass-card p-12 rounded-[3.5rem] space-y-8">
            <h3 className="text-xl font-black mb-4">Metadata</h3>
            
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol Email</p>
                    <p className="text-sm font-bold truncate">{user.email}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Initiation Date</p>
                    <p className="text-sm font-bold">March 2024</p>
                  </div>
               </div>
            </div>

            <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
              <Settings className="w-4 h-4" />
              Modify Config
            </button>
          </div>
          
          <div className="glass-card p-12 rounded-[3.5rem] bg-indigo-600/10 border-indigo-500/20">
             <h3 className="text-lg font-black mb-4">Identity Verification</h3>
             <p className="text-sm text-indigo-300 font-medium leading-relaxed mb-8">
               Your account is secured with end-to-end OTP handshakes. Always keep your verification keys private.
             </p>
             <div className="flex items-center gap-3 text-emerald-500">
                <Shield className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Hub Active</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
