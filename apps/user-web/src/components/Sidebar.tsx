import { 
  Home, Search, Wallet, User, Store, MessageSquare, 
  Trophy, LogOut, ShieldCheck, Gift, Users, 
  TrendingUp, Sparkles, Settings, HardDrive, Target 
} from 'lucide-react';
import { useStore } from '../store';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const AppLink = Link as any;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <AppLink
      to={to}
      className={cn(
        "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group",
        isActive 
          ? "bg-indigo-600/10 text-indigo-500 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]" 
          : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 transition-transform duration-500 group-hover:scale-110",
        isActive ? "text-indigo-500" : ""
      )} />
      <span className="text-sm font-bold tracking-tight">{label}</span>
      <div className={cn(
        "ml-auto transition-opacity",
        isActive ? "opacity-100" : "opacity-0"
      )}>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
      </div>
    </AppLink>
  );
};

export const Sidebar = () => {
  const { user, logout } = useStore();

  return (
    <aside className="w-80 h-screen fixed left-0 top-0 nav-blur flex flex-col p-8 z-50">
      <div className="flex items-center gap-4 mb-12 px-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20 group cursor-pointer transition-transform hover:scale-105 active:scale-95">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter leading-none mb-1">Onchat</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Web Engine v1.0</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <div className="mb-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] px-6 mb-4">Discovery</p>
          <div className="space-y-1">
            <SidebarItem to="/" icon={Home} label="Feed" />
            <SidebarItem to="/search" icon={Search} label="Explore" />
            <SidebarItem to="/daily-reward" icon={Gift} label="Daily Gifts" />
            <SidebarItem to="/family" icon={Users} label="Dynasty" />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] px-6 mb-4">Personal</p>
          <div className="space-y-1">
            <SidebarItem to="/profile" icon={User} label="Identity" />
            <SidebarItem to="/wallet" icon={Wallet} label="Vault" />
            <SidebarItem to="/creator" icon={TrendingUp} label="Studio" />
            <SidebarItem to="/messages" icon={MessageSquare} label="Comms" />
            <SidebarItem to="/settings" icon={Settings} label="Portal Settings" />
            <SidebarItem to="/storage" icon={HardDrive} label="VFS Vault" />
            <SidebarItem to="/interests" icon={Target} label="Neural Match" />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] px-6 mb-4">Market</p>
          <div className="space-y-1">
            <SidebarItem to="/store" icon={Store} label="Outfits" />
            <SidebarItem to="/leaderboard" icon={Trophy} label="Rankings" />
            <SidebarItem to="/lucky-wheel" icon={Sparkles} label="Fate Wheel" />
            <SidebarItem to="/griddy" icon={Trophy} label="Griddy Luck" />
          </div>
        </div>
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5">
        {user ? (
          <div className="flex items-center gap-4 px-2 mb-8 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-indigo-500/50 transition-colors shadow-2xl">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.shortId}`} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate">{user.name}</p>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">LV.{Math.floor(user.coins / 1000) + 1}</p>
            </div>
            <button 
              onClick={logout}
              className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <AppLink
            to="/login"
            className="w-full premium-gradient text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all uppercase tracking-widest text-[11px]"
          >
            Terminal Login
          </AppLink>
        )}
        
        <div className="flex items-center justify-between px-2 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Mainnet Live</span>
          </div>
          <span className="text-[9px] font-black text-slate-800 tabular-nums uppercase">Secure.</span>
        </div>
      </div>
    </aside>
  );
};
