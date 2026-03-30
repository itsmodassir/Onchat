import { 
  Home, Search, Wallet, User, Store, MessageSquare, 
  Trophy, LogOut, ShieldCheck, Gift, Users, 
  TrendingUp, Sparkles, Settings, HardDrive, Target,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useStore } from '../store';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

const AppLink = Link as any;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ to, icon: Icon, label, collapsed }: { to: string; icon: any; label: string; collapsed: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <AppLink
      to={to}
      className={cn(
        "flex items-center gap-4 py-4 rounded-2xl transition-all duration-300 group relative",
        collapsed ? "px-0 justify-center h-14" : "px-6",
        isActive 
          ? "bg-indigo-600/10 text-indigo-500 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]" 
          : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 transition-transform duration-500 group-hover:scale-110 shrink-0",
        isActive ? "text-indigo-500" : ""
      )} />
      
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="text-sm font-bold tracking-tight truncate"
        >
          {label}
        </motion.span>
      )}

      {isActive && !collapsed && (
        <div className="ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
        </div>
      )}

      {collapsed && isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
      )}
    </AppLink>
  );
};

export const Sidebar = () => {
  const { user, logout, sidebarCollapsed: collapsed, toggleSidebar: toggle } = useStore();

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: collapsed ? 96 : 320,
        padding: collapsed ? "24px 12px" : "32px"
      }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen fixed left-0 top-0 nav-blur flex flex-col z-50 border-r border-white/5"
    >
      {/* Neural Toggle Button */}
      <button 
        onClick={toggle}
        className="absolute -right-4 top-12 w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 shadow-2xl transition-all z-[60]"
      >
        {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>

      {user && (
        <AppLink to="/profile" className={cn(
          "flex items-center gap-4 mb-12 hover:bg-white/5 rounded-3xl transition-all group overflow-hidden",
          collapsed ? "px-0 justify-center p-2" : "px-2 p-2"
        )}>
          <div className={cn(
            "rounded-2xl overflow-hidden border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-all shadow-2xl shrink-0",
            collapsed ? "w-12 h-12" : "w-14 h-14"
          )}>
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.shortId}`} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0"
              >
                <h1 className="text-xl font-black truncate text-white">{user.name}</h1>
                <div className="flex items-center gap-2">
                   <div className="px-2 py-0.5 rounded-md bg-indigo-500 text-[8px] font-black text-white uppercase tracking-tighter">LV.{Math.floor(user.coins / 1000) + 1}</div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{user.shortId}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </AppLink>
      )}

      <nav className="flex-1 space-y-8 overflow-y-auto no-scrollbar py-2">
        <div>
          {!collapsed && <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] px-6 mb-4">Discovery</p>}
          <div className={cn("space-y-1", collapsed ? "px-0" : "")}>
            <SidebarItem to="/" icon={Home} label="Feed" collapsed={collapsed} />
            <SidebarItem to="/search" icon={Search} label="Explore" collapsed={collapsed} />
            <SidebarItem to="/daily-reward" icon={Gift} label="Daily Gifts" collapsed={collapsed} />
            <SidebarItem to="/family" icon={Users} label="Dynasty" collapsed={collapsed} />
          </div>
        </div>

        <div>
          {!collapsed && <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] px-6 mb-4">Personal</p>}
          <div className={cn("space-y-1", collapsed ? "px-0" : "")}>
            <SidebarItem to="/profile" icon={User} label="Identity" collapsed={collapsed} />
            <SidebarItem to="/wallet" icon={Wallet} label="Vault" collapsed={collapsed} />
            <SidebarItem to="/creator" icon={TrendingUp} label="Studio" collapsed={collapsed} />
            <SidebarItem to="/messages" icon={MessageSquare} label="Comms" collapsed={collapsed} />
            <SidebarItem to="/settings" icon={Settings} label="Portal Settings" collapsed={collapsed} />
            <SidebarItem to="/storage" icon={HardDrive} label="VFS Vault" collapsed={collapsed} />
            <SidebarItem to="/interests" icon={Target} label="Neural Match" collapsed={collapsed} />
          </div>
        </div>

        <div>
          {!collapsed && <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] px-6 mb-4">Market</p>}
          <div className={cn("space-y-1", collapsed ? "px-0" : "")}>
            <SidebarItem to="/store" icon={Store} label="Outfits" collapsed={collapsed} />
            <SidebarItem to="/leaderboard" icon={Trophy} label="Rankings" collapsed={collapsed} />
            <SidebarItem to="/lucky-wheel" icon={Sparkles} label="Fate Wheel" collapsed={collapsed} />
            <SidebarItem to="/griddy" icon={Trophy} label="Griddy Luck" collapsed={collapsed} />
          </div>
        </div>
      </nav>

      <div className={cn("mt-auto pt-8 border-t border-white/5", collapsed ? "px-0" : "")}>
        {!user ? (
          <AppLink
            to="/login"
            className={cn(
              "w-full premium-gradient text-white font-black rounded-2xl flex items-center justify-center transition-all uppercase tracking-widest text-[11px]",
              collapsed ? "h-14" : "py-4"
            )}
          >
            {collapsed ? <LogOut className="w-5 h-5" /> : "Terminal Login"}
          </AppLink>
        ) : (
          <div className={cn("flex items-center justify-between", collapsed ? "flex-col gap-6" : "px-2")}>
            <div className={cn("flex items-center gap-3", collapsed ? "flex-col" : "")}>
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              {!collapsed && <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Onchat v1.0</span>}
            </div>
            <button 
              onClick={logout}
              className={cn(
                "text-[10px] font-black text-slate-600 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2",
                collapsed ? "flex-col" : ""
              )}
            >
              {collapsed ? <LogOut className="w-5 h-5" /> : "Disconnect"}
            </button>
          </div>
        )}
        
        {!collapsed && (
          <div className="flex items-center justify-between px-2 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Mainnet Live</span>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
