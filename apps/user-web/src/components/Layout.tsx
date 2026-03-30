import React from 'react';
import { Sidebar } from './Sidebar';
import { useStore } from '../store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { token, sidebarCollapsed } = useStore();

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-indigo-500/20">
      {token && <Sidebar />}
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-500 ease-in-out",
        token 
          ? (sidebarCollapsed ? 'ml-24' : 'ml-80') 
          : 'ml-0'
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};
