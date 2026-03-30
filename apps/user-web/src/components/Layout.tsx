import React from 'react';
import { Sidebar } from './Sidebar';
import { useStore } from '../store';
import { Menu, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { token, sidebarCollapsed, mobileMenuOpen, toggleMobileMenu } = useStore();

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-indigo-500/20 relative">
      {token && <Sidebar />}
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-500 ease-in-out flex flex-col w-full relative overflow-x-hidden",
        token 
          ? (sidebarCollapsed ? 'md:ml-24' : 'md:ml-[320px]') 
          : 'ml-0'
      )}>
        {token && (
          <div className="md:hidden sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 h-16 w-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                 <span className="text-white font-black leading-none text-xl">O</span>
              </div>
              <span className="text-white font-black text-lg tracking-tighter">ONCHAT</span>
            </div>
            <button 
              onClick={toggleMobileMenu}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
