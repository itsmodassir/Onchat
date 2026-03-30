import { useState, useEffect } from 'react';
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

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

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
  const { user, logout, sidebarCollapsed: collapsed, toggleSidebar: toggle, mobileMenuOpen, setMobileMenuOpen } = useStore();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // For responsive navigation logic: on mobile, tapping a link should close the menu
  const handleMobileNav = () => {
    if (isMobile) setMobileMenuOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-[60] bg-[#020617]/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        variants={{
          desktopExpanded: { width: 320, padding: "32px", x: 0 },
          desktopCollapsed: { width: 96, padding: "24px 12px", x: 0 },
          mobileOpen: { width: 320, padding: "32px", x: 0 },
          mobileClosed: { width: 320, padding: "32px", x: "-100%" }
        }}
        animate={
          isMobile 
            ? (mobileMenuOpen ? 'mobileOpen' : 'mobileClosed')
            : (collapsed ? 'desktopCollapsed' : 'desktopExpanded')
        }
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="h-[100dvh] fixed left-0 top-0 nav-blur flex flex-col z-[70] border-r border-white/5 shadow-2xl md:shadow-none"
      >
        {/* Neural Toggle Button (Desktop Only) */}
        {!isMobile && (
          <button 
            onClick={toggle}
            className="absolute -right-4 top-12 w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 shadow-2xl transition-all z-[60]"
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}

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
        <div onClick={handleMobileNav}>
          {(!collapsed || isMobile) && <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] px-6 mb-4">Discovery</p>}
          <div className={cn("space-y-1", (collapsed && !isMobile) ? "px-0" : "")}>
            <SidebarItem to="/" icon={Home} label="Feed" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/search" icon={Search} label="Explore" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/daily-reward" icon={Gift} label="Daily Gifts" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/family" icon={Users} label="Dynasty" collapsed={collapsed && !isMobile} />
          </div>
        </div>

        <div onClick={handleMobileNav}>
          {(!collapsed || isMobile) && <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] px-6 mb-4">Personal</p>}
          <div className={cn("space-y-1", (collapsed && !isMobile) ? "px-0" : "")}>
            <SidebarItem to="/profile" icon={User} label="Identity" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/wallet" icon={Wallet} label="Vault" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/creator" icon={TrendingUp} label="Studio" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/messages" icon={MessageSquare} label="Comms" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/settings" icon={Settings} label="Portal Settings" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/storage" icon={HardDrive} label="VFS Vault" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/interests" icon={Target} label="Neural Match" collapsed={collapsed && !isMobile} />
          </div>
        </div>

        <div onClick={handleMobileNav}>
          {(!collapsed || isMobile) && <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] px-6 mb-4">Market</p>}
          <div className={cn("space-y-1", (collapsed && !isMobile) ? "px-0" : "")}>
            <SidebarItem to="/store" icon={Store} label="Outfits" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/leaderboard" icon={Trophy} label="Rankings" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/lucky-wheel" icon={Sparkles} label="Fate Wheel" collapsed={collapsed && !isMobile} />
            <SidebarItem to="/griddy" icon={Trophy} label="Griddy Luck" collapsed={collapsed && !isMobile} />
          </div>
        </div>
      </nav>

      <div className={cn("mt-auto pt-8 border-t border-white/5 pb-6", (collapsed && !isMobile) ? "px-0" : "")}>
        {!user ? (
          <AppLink
            to="/login"
            className={cn(
              "w-full premium-gradient text-white font-black rounded-2xl flex items-center justify-center transition-all uppercase tracking-widest text-[11px]",
              (collapsed && !isMobile) ? "h-14" : "py-4"
            )}
          >
            {(collapsed && !isMobile) ? <LogOut className="w-5 h-5" /> : "Terminal Login"}
          </AppLink>
        ) : (
          <div className={cn("flex items-center justify-between", (collapsed && !isMobile) ? "flex-col gap-6" : "px-2")}>
            <div className={cn("flex items-center gap-3", (collapsed && !isMobile) ? "flex-col" : "")}>
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              {(!collapsed || isMobile) && <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Onchat v1.0</span>}
            </div>
            <button 
              onClick={() => { logout(); handleMobileNav(); }}
              className={cn(
                "text-[10px] font-black text-slate-600 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2",
                (collapsed && !isMobile) ? "flex-col" : ""
              )}
            >
              {(collapsed && !isMobile) ? <LogOut className="w-5 h-5" /> : "Disconnect"}
            </button>
          </div>
        )}
        
        {(!collapsed || isMobile) && (
          <div className="flex items-center justify-between px-2 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Mainnet Live</span>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
    </>
  );
};

