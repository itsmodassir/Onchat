import { useState } from 'react';
import { RoomCard } from '../components/RoomCard';
import { Flame, Sparkles, Clock, LayoutGrid } from 'lucide-react';

const MOCK_ROOMS = [
  {
    id: '1',
    name: 'Techno Night & Vibing',
    host: { name: 'DJ Shadow' },
    userCount: 1.2,
    category: 'Music',
  },
  {
    id: '2',
    name: 'Startup Pitch & Roast',
    host: { name: 'Alex' },
    userCount: 842,
    category: 'Business',
  },
  {
    id: '3',
    name: 'Midnight Chill Lounge',
    host: { name: 'Luna' },
    userCount: 2.1,
    category: 'Relax',
  },
  {
    id: '4',
    name: 'Global News Breakdown',
    host: { name: 'The Reporter' },
    userCount: 450,
    category: 'News',
  },
  {
    id: '5',
    name: 'Gaming & Strategy Chat',
    host: { name: 'ProGamer' },
    userCount: 928,
    category: 'Gaming',
  },
  {
    id: '6',
    name: 'Late Night Therapy',
    host: { name: 'Dr. Sarah' },
    userCount: 3.1,
    category: 'Talk',
  }
];

export const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState('hot');

  return (
    <div className="p-12 pb-24 space-y-16 animate-in fade-in duration-700">
      {/* Hero */}
      <section className="relative h-80 rounded-[3rem] overflow-hidden flex flex-col justify-center px-16">
        <div className="absolute inset-0 bg-slate-950">
          <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-20"
            alt="Hero BG"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            Platform Spotlight
          </div>
          <h2 className="text-6xl font-black tracking-tighter mb-6 leading-[1.1]">
            Experience the <br/>
            <span className="premium-gradient bg-clip-text text-transparent italic">Future of Voice.</span>
          </h2>
          <p className="text-lg text-slate-400 font-medium">
            Join thousands of communities in real-time. High fidelity audio, <br/>
            virtual identities, and decentralized interaction.
          </p>
        </div>
      </section>

      {/* Discovery Hub */}
      <section>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-12 border-b border-white/5 pb-2">
            {[
              { id: 'hot', label: 'Trending Feed', icon: Flame },
              { id: 'new', label: 'Recent Waves', icon: Clock },
              { id: 'all', label: 'Live Cluster', icon: LayoutGrid }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 pb-4 transition-all relative ${
                  activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-500' : ''}`} />
                <span className="text-sm font-black uppercase tracking-widest">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Channels:</span>
             <span className="text-[10px] font-black text-indigo-500 px-3 py-1 bg-indigo-500/10 rounded-lg">1,248</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {MOCK_ROOMS.map(room => (
            <RoomCard key={room.id} room={room as any} />
          ))}
        </div>
      </section>
    </div>
  );
};
