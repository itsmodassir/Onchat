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
      {user && (
        <AppLink to="/profile" className="flex items-center gap-4 mb-12 px-2 hover:bg-white/5 p-2 rounded-3xl transition-all group">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-colors shadow-2xl">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.shortId}`} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black truncate text-white">{user.name}</h1>
            <div className="flex items-center gap-2">
               <div className="px-2 py-0.5 rounded-md bg-indigo-500 text-[8px] font-black text-white uppercase tracking-tighter">LV.{Math.floor(user.coins / 1000) + 1}</div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{user.shortId}</span>
            </div>
          </div>
        </AppLink>
      )}

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
        {!user ? (
          <AppLink
            to="/login"
            className="w-full premium-gradient text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all uppercase tracking-widest text-[11px]"
          >
            Terminal Login
          </AppLink>
        ) : (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Onchat v1.0</span>
            </div>
            <button 
              onClick={logout}
              className="text-[10px] font-black text-slate-600 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              Disconnect <LogOut className="w-3 h-3" />
            </button>
          </div>
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
