import { 
  Users, Mic2, PlayCircle, Crown, 
  Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppLink = (Link as any);

interface Room {
  id: string;
  name: string;
  host: {
    name: string;
    avatar?: string;
    svip?: number;
    level?: number;
  };
  userCount: number;
  category: string;
  thumbnail?: string;
  isLive?: boolean;
}

export const RoomCard = ({ room }: { room: Room }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <AppLink to={`/room/${room.id}`} className="group relative glass-card rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer block bg-slate-900/40 border-white/5 backdrop-blur-3xl">
        {/* Thumbnail / Ambient Background */}
        <div className="aspect-[16/10] relative overflow-hidden bg-slate-800">
          <img 
            src={room.thumbnail || `https://images.unsplash.com/photo-1614850523296-d8c1af03d400?q=80&w=800&auto=format&fit=crop`} 
            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-110"
            alt={room.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Audio Waveform Animation (Live Indicator) */}
          <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-indigo-600/90 backdrop-blur-md rounded-2xl shadow-xl shadow-indigo-600/30">
            <div className="flex items-center gap-1.5">
               <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
               <div className="w-1 h-5 bg-white rounded-full animate-pulse delay-75" />
               <div className="w-1 h-2 bg-white rounded-full animate-pulse delay-150" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">LIVE SIGNAL</span>
          </div>

          {/* User Count Badge */}
          <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-slate-950/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-black text-white tabular-nums tracking-tight">{room.userCount}</span>
          </div>

          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-3xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 group-active:scale-95">
               <PlayCircle className="w-10 h-10 text-white fill-white/20" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest shadow-inner">
                {room.category}
              </span>
              <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10">
                 <Mic2 className="w-3 h-3" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Open Mic</span>
              </div>
            </div>
            {room.userCount > 100 && (
              <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
            )}
          </div>
          
          <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors line-clamp-1 tracking-tight leading-tight">
            {room.name}
          </h3>

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-[1.25rem] overflow-hidden border-2 border-indigo-500/30 bg-slate-800 shadow-xl group-hover:rotate-6 transition-transform">
                  <img 
                    src={room.host.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.host.name}`} 
                    className="w-full h-full object-cover"
                    alt={room.host.name}
                  />
                </div>
                {room.host.svip && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg border border-slate-950">
                    <Crown className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <span className="text-sm font-black text-white block group-hover:translate-x-1 transition-transform">{room.host.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="px-2 py-0.5 rounded-md bg-indigo-500 text-[8px] font-black text-white uppercase tracking-tighter">LV.{room.host.level || 1}</div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">VFS Certified</span>
                </div>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all border border-indigo-400/20"
            >
               Join Now
            </motion.button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/5 blur-[80px] pointer-events-none group-hover:bg-indigo-600/10 transition-colors" />
      </AppLink>
    </motion.div>
  );
};
