import React from 'react';
import { Sidebar } from './Sidebar';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-indigo-500/20">
      <Sidebar />
      <main className="flex-1 ml-80 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
