import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Zap, Star, Heart, Gem, Coins } from 'lucide-react';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (giftId: string, points: number) => void;
  recipientName: string;
}

const GIFTS = [
  { id: 'rose', name: 'Rose', price: 1, icon: <Heart className="w-6 h-6 text-rose-500" /> },
  { id: 'star', name: 'Star', price: 10, icon: <Star className="w-6 h-6 text-amber-500" /> },
  { id: 'zap', name: 'Thunder', price: 50, icon: <Zap className="w-6 h-6 text-indigo-500" /> },
  { id: 'diamond', name: 'Diamond', price: 100, icon: <Gem className="w-6 h-6 text-cyan-400" /> },
  { id: 'crown', name: 'Crown', price: 500, icon: <Coins className="w-6 h-6 text-yellow-500" /> },
];

export const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose, onSend, recipientName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-3">
                  <Gift className="w-6 h-6 text-indigo-500" />
                  Send Express Gift
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Recipient: {recipientName}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 grid grid-cols-3 gap-4">
              {GIFTS.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => {
                    onSend(gift.id, gift.price);
                    onClose();
                  }}
                  className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group active:scale-95"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                    {gift.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-white uppercase tracking-tighter">{gift.name}</p>
                    <p className="text-[9px] font-black text-amber-500">{gift.price} LP</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-8 bg-black/20 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance: 12,450 LP</span>
              <button className="px-6 py-2 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all">Recharge</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
