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
      <AppLink to={`/room/${room.id}`} className="group relative glass-card rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer block bg-slate-900 border border-white/5 backdrop-blur-3xl aspect-[3/4]">
        {/* Background Image Layer */}
        <img 
          src={room.thumbnail || `https://images.unsplash.com/photo-1614850523296-d8c1af03d400?q=80&w=800&auto=format&fit=crop`} 
          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-all duration-1000 group-hover:scale-110"
          alt={room.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-600/90 backdrop-blur-md rounded-xl shadow-xl">
             <div className="flex items-end gap-0.5 h-2.5">
                <div className="w-[2px] h-[60%] bg-white rounded-full animate-pulse" />
                <div className="w-[2px] h-full bg-white rounded-full animate-pulse delay-75" />
                <div className="w-[2px] h-[40%] bg-white rounded-full animate-pulse delay-150" />
             </div>
             <span className="text-[8px] font-black uppercase tracking-widest text-white">Live</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10">
            <Users className="w-3 h-3 text-indigo-400" />
            <span className="text-[10px] font-black text-white tabular-nums tracking-tight">{room.userCount}</span>
          </div>
        </div>

        {/* Play Icon Reveal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-3xl transform scale-90 group-hover:scale-100 transition-transform duration-500">
             <PlayCircle className="w-6 h-6 text-white fill-white/20" />
          </div>
        </div>

        {/* Content Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 z-20 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[8px] font-black uppercase tracking-widest shadow-inner backdrop-blur-sm">
              {room.category}
            </span>
            {room.userCount > 100 && (
              <Flame className="w-3 h-3 text-orange-500 animate-bounce" />
            )}
          </div>
          
          <h3 className="text-sm md:text-base font-black text-white group-hover:text-indigo-400 transition-colors line-clamp-2 tracking-tight leading-tight mb-3">
            {room.name}
          </h3>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 max-w-[80%]">
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-xl overflow-hidden border border-indigo-500/30 bg-slate-800 group-hover:rotate-12 transition-transform">
                  <img 
                    src={room.host.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.host.name}`} 
                    className="w-full h-full object-cover"
                    alt={room.host.name}
                  />
                </div>
                {room.host.svip && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-md bg-amber-500 flex items-center justify-center shadow-lg border border-slate-950">
                    <Crown className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-white truncate">{room.host.name}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">LV.{room.host.level || 1} • Host</span>
              </div>
            </div>
            
            <div className="w-6 h-6 shrink-0 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-indigo-500/30">
               <Mic2 className="w-3 h-3" />
            </div>
          </div>
        </div>
      </AppLink>
    </motion.div>
  );
};
