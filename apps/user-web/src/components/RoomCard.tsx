
import { Users, Mic2, PlayCircle } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  host: {
    name: string;
    avatar?: string;
  };
  userCount: number;
  category: string;
  thumbnail?: string;
}

export const RoomCard = ({ room }: { room: Room }) => {
  return (
    <div className="group relative glass-card rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer">
      {/* Thumbnail / Ambient Background */}
      <div className="aspect-[4/3] relative overflow-hidden bg-slate-800">
        <img 
          src={room.thumbnail || `https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=600&auto=format&fit=crop`} 
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
          alt={room.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {/* Live Indicator */}
        <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full shadow-lg shadow-red-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Live</span>
        </div>

        {/* User Count Badge */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/5">
          <Users className="w-3 h-3 text-indigo-400" />
          <span className="text-[10px] font-black text-white tabular-nums">{room.userCount}</span>
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/40 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <PlayCircle className="w-8 h-8 text-white fill-white/20" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
            {room.category}
          </span>
          <div className="flex items-center gap-1.5 text-slate-500">
             <Mic2 className="w-3 h-3" />
             <span className="text-[10px] font-bold">Audio Active</span>
          </div>
        </div>
        
        <h3 className="text-xl font-black text-white mb-6 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {room.name}
        </h3>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10">
              <img 
                src={room.host.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.host.name}`} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">{room.host.name}</span>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
             Join Room
          </button>
        </div>
      </div>
    </div>
  );
};
