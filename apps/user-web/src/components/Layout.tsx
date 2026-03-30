import React from 'react';
import { Sidebar } from './Sidebar';
import { useStore } from '../store';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const token = useStore(state => state.token);

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-indigo-500/20">
      {token && <Sidebar />}
      <main className={`flex-1 ${token ? 'ml-80' : 'ml-0'} min-h-screen`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
