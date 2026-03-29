import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, UploadCloud, Trash2, HardDrive, 
  Image as ImageIcon, AlertCircle, Clock, 
  ShieldCheck, FileText,
  Search
} from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const StorageManagerScreen = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, mediaRes] = await Promise.all([
        api.get('/storage/stats'),
        api.get('/storage/media')
      ]);
      setStats(statsRes.data);
      setMedia(mediaRes.data);
    } catch (error) {
      console.error('Failed to fetch storage data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/storage/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Media successfully uploaded to virtual vault.');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Protocol rejection. File mismatch or storage limit.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently erase this asset from your storage cluster?')) return;
    try {
      await api.delete(`/storage/media/${id}`);
      fetchData();
    } catch {
      alert('Failed to delete media asset.');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
            >
               <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
               <h1 className="text-4xl font-black tracking-tight text-white mb-1 uppercase tracking-tighter">Virtual Storage</h1>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Localized Asset Clustering
               </p>
            </div>
         </div>

         <div className="flex gap-4">
            <label className="cursor-pointer">
               <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
               <div className="px-8 py-3 rounded-2xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  {uploading ? 'Transmitting...' : 'Upload Asset'}
               </div>
            </label>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
         {/* Stats Panel */}
         <aside className="lg:col-span-1 space-y-8">
            <div className="glass-card p-8 rounded-[3rem] border border-white/5 space-y-8 bg-slate-900/40 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] pointer-events-none" />
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                     <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Integrity</p>
                     <p className="text-xl font-black text-white">10.0 GB</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest mb-1">
                     <span className="text-slate-400">{formatBytes(stats?.used || 0)} used</span>
                     <span className="text-indigo-400">{stats?.percentage?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats?.percentage || 0}%` }}
                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                     />
                  </div>
               </div>

               <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                     <div className="flex items-center gap-3">
                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Images</span>
                     </div>
                     <span className="text-[10px] font-black text-white">{media.length}</span>
                  </div>
                  <div className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                     <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</span>
                     </div>
                     <span className="text-[10px] font-black text-white">0</span>
                  </div>
               </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border-white/5 flex items-center gap-4 group cursor-help">
               <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-colors">
                  <AlertCircle className="w-5 h-5" />
               </div>
               <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] leading-relaxed">
                  Encryption active for all data packets in transit and rest.
               </p>
            </div>
         </aside>

         {/* Content Grid */}
         <main className="lg:col-span-3 space-y-10">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-600" />
                  Identity Assets
               </h2>
               <div className="flex gap-4">
                  <div className="relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                     <input type="text" placeholder="Search Assets..." className="bg-slate-900 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase text-white outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-800" />
                  </div>
               </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {Array.from({ length: 8 }).map((_, i) => (
                   <div key={i} className="aspect-square rounded-3xl bg-slate-900/50 animate-pulse border border-white/5" />
                 ))}
              </div>
            ) : media.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {media.map((item) => (
                   <motion.div 
                     layoutId={item.id}
                     key={item.id}
                     whileHover={{ y: -4 }}
                     className="group relative aspect-square rounded-3xl overflow-hidden border border-white/5 bg-slate-900"
                   >
                      <img 
                        src={`https://api.onchat.fun${item.path}`} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                        alt="Asset"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="absolute top-4 right-4 flex gap-2">
                         <button 
                           onClick={() => handleDelete(item.id)}
                           className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                         <p className="text-[8px] font-black text-white uppercase tracking-widest truncate">{item.name}</p>
                         <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{formatBytes(item.size || 0)}</p>
                      </div>
                   </motion.div>
                 ))}
              </div>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 glass-card rounded-[3.5rem] border-dashed border-2 border-white/5">
                 <div className="w-20 h-20 rounded-[2rem] bg-slate-950 flex items-center justify-center text-slate-800">
                    <ImageIcon className="w-10 h-10" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-sm font-black text-white uppercase tracking-tight">VFS Layer Empty</p>
                    <p className="text-xs text-slate-600 font-bold max-w-[200px]">Synchronize your first media asset to activate cluster display.</p>
                 </div>
              </div>
            )}
         </main>
      </div>
    </div>
  );
};
