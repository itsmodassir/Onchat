import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2, Coins, Trophy, Sparkles } from 'lucide-react';
import api from '../utils/api';

interface GriddyGameOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  socketRef: React.MutableRefObject<any>;
}

const BET_AMOUNTS = [10, 50, 100, 500];

export const GriddyGameOverlay: React.FC<GriddyGameOverlayProps> = ({ isOpen, onClose, roomId, socketRef }) => {
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'BETTING' | 'SPINNING'>('IDLE');
  const [timeLeft, setTimeLeft] = useState(10);
  const [myBet, setMyBet] = useState<number | null>(null);
  const [totalBets, setTotalBets] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeSpinIndex, setActiveSpinIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on('griddy-round-started', (data: any) => {
      setGameStatus('BETTING');
      setTimeLeft(data.timeLeft);
      setMyBet(null);
      setTotalBets(0);
      setResult(null);
    });

    socketRef.current.on('griddy-countdown', (data: any) => {
      setTimeLeft(data.timeLeft);
    });

    socketRef.current.on('griddy-bet-placed', (data: any) => {
      setTotalBets(data.totalBets);
    });

    socketRef.current.on('griddy-round-result', (data: any) => {
      setGameStatus('SPINNING');
      
      let spinCount = 0;
      const flashInterval = setInterval(() => {
        setActiveSpinIndex(Math.floor(Math.random() * 9) + 1);
        spinCount++;
        
        if (spinCount > 20) {
          clearInterval(flashInterval);
          setActiveSpinIndex(null);
          
          setResult({
            position: data.result,
            isWon: !!myBet && data.multiplier > 0,
            wonAmount: myBet ? data.multiplier * myBet : 0
          });
          
          setGameStatus('IDLE');
          setIsPlaying(false);
          fetchHistory();
        }
      }, 100);
    });

    return () => {
      socketRef.current?.off('griddy-round-started');
      socketRef.current?.off('griddy-countdown');
      socketRef.current?.off('griddy-bet-placed');
      socketRef.current?.off('griddy-round-result');
    };
  }, [socketRef]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/luck/griddy/history');
      setHistory(data);
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  const playGriddy = async () => {
    if (gameStatus === 'IDLE') {
      socketRef.current?.emit('start-griddy-round', { roomId });
    } else if (gameStatus === 'BETTING' && !myBet) {
      socketRef.current?.emit('place-griddy-bet', { roomId, betAmount });
      setMyBet(betAmount);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl"
          >
            {/* Left Side: Game Board */}
            <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
               {/* Background Gradients */}
               <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[100px] rounded-full" />
                  <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/20 blur-[100px] rounded-full" />
               </div>

               <div className="relative z-10 w-full max-w-sm mx-auto">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
                          <Gamepad2 className="w-8 h-8 text-amber-500" />
                          GRIDDY
                        </h2>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Spin & Win Multipliers</p>
                     </div>
                     <button 
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex md:hidden items-center justify-center text-slate-400 hover:text-white transition-all"
                      >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Grid Board */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-black/40 border border-white/10 rounded-3xl shadow-inner mb-8 relative">
                     {Array.from({ length: 9 }).map((_, i) => {
                        const cellNum = i + 1;
                        let cellType = 'empty';
                        if (cellNum >= 6 && cellNum <= 7) cellType = '2x';
                        if (cellNum === 8) cellType = '5x';
                        if (cellNum === 9) cellType = '20x';

                        const isWinningCell = result && result.position === cellNum;
                        const isSpinningHere = activeSpinIndex === cellNum;
                        
                        return (
                          <div 
                            key={i} 
                            className={`aspect-square rounded-full md:rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all duration-150
                                ${isSpinningHere ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-110 z-10' : ''}
                                ${isWinningCell && result.isWon ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-110 z-10' : ''}
                                ${isWinningCell && !result.isWon ? 'bg-rose-500 border-rose-400 text-white opacity-50 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : ''}
                                ${!isSpinningHere && !isWinningCell ? 'bg-slate-900/60 border-white/10 text-slate-500 shadow-inner' : ''}
                            `}
                          >
                             {isWinningCell ? (
                               result.isWon ? <Sparkles className="w-8 h-8 text-white" /> : <X className="w-8 h-8" />
                             ) : (
                                cellType !== 'empty' ? <span className={`text-xs font-bold uppercase tracking-widest ${isSpinningHere ? 'text-white' : 'text-amber-500/50'}`}>{cellType}</span> : '•'
                             )}
                          </div>
                        );
                     })}

                     {/* Overlay Result Animation */}
                     <AnimatePresence>
                        {result && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                          >
                             {result.isWon ? (
                               <div className="bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl border border-emerald-400 flex items-center gap-4">
                                  <Trophy className="w-8 h-8" />
                                  <div className="text-left">
                                     <p className="font-black text-2xl uppercase tracking-tighter">WINNER!</p>
                                     <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">+{result.wonAmount} LP</p>
                                  </div>
                               </div>
                             ) : (
                               <div className="bg-rose-500 text-white px-8 py-3 rounded-2xl shadow-2xl border border-rose-400 font-black uppercase tracking-widest">
                                  Try Again
                               </div>
                             )}
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  {/* Controls */}
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Select Wager</p>
                     <div className="grid grid-cols-4 gap-2">
                        {BET_AMOUNTS.map(amt => (
                           <button
                             key={amt}
                             onClick={() => !isPlaying && setBetAmount(amt)}
                             className={`py-3 rounded-xl border flex items-center justify-center gap-1 font-black text-xs transition-all
                                ${betAmount === amt 
                                  ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                }
                                ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}
                             `}
                           >
                              <Coins className="w-3 h-3" />
                              {amt}
                           </button>
                        ))}
                     </div>
                      <button
                        onClick={playGriddy}
                        disabled={gameStatus === 'SPINNING' || (gameStatus === 'BETTING' && !!myBet)}
                        className="w-full py-5 rounded-2xl bg-indigo-500 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-400 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                      >
                        {gameStatus === 'IDLE' && 'START ROUND'}
                        {gameStatus === 'BETTING' && !myBet && `JOIN ROUND (${timeLeft}s)`}
                        {gameStatus === 'BETTING' && myBet && `BET PLACED (${timeLeft}s)`}
                        {gameStatus === 'SPINNING' && 'LOCKED'}
                        
                        {gameStatus === 'BETTING' && (
                          <motion.div 
                            initial={{ width: '100%' }}
                            animate={{ width: `${(timeLeft / 10) * 100}%` }}
                            className="absolute bottom-0 left-0 h-1 bg-white/20"
                          />
                        )}
                      </button>
                      
                      {totalBets > 0 && (
                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                           {totalBets} Players Active in this Round
                        </p>
                      )}
                  </div>
               </div>
            </div>

            {/* Right Side: Leaderboard */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/5 bg-black/20 p-8 flex flex-col relative">
               <button 
                  onClick={onClose}
                  className="absolute right-8 top-8 w-10 h-10 rounded-2xl bg-white/5 border border-white/5 hidden md:flex items-center justify-center text-slate-400 hover:text-white transition-all z-10"
               >
                  <X className="w-5 h-5" />
               </button>

               <div className="flex items-center gap-3 mb-8 text-amber-500">
                  <Trophy className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Global Top Spins</span>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none pr-2">
                  {history.map((record: any) => (
                    <div key={record.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                       <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                          <img src={record.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.userId}`} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-white uppercase tracking-wider truncate">{record.user?.name}</p>
                          <p className="text-[9px] font-bold text-amber-500 flex items-center gap-1 uppercase tracking-widest mt-0.5">
                            WON {(record.amount * record.multiplier).toLocaleString()} LP
                          </p>
                       </div>
                       <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <span className="text-amber-500 text-[10px] font-black">{record.multiplier}x</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
