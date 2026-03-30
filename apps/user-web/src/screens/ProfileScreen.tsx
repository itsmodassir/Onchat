import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import api from '../utils/api';
import { 
  Crown, Gem, Coins, Heart, 
  ShoppingBag, Briefcase, Flame,
  Settings, LogOut, Trophy, 
  ShieldCheck, Camera, Wallet,
  ArrowRight, Edit3, Loader2,
  UserPlus, UserMinus, MessageCircle, Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppLink = Link as any;

export const ProfileScreen = () => {
  const { userId: urlUserId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, logout, setUser } = useStore();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isSelf, setIsSelf] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', bio: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const targetId = urlUserId || currentUser?.id;
      if (!targetId) return;

      const { data } = await api.get(`/users/profile/${targetId}`);
      setProfileUser(data);
      setIsSelf(data.id === currentUser?.id);
      setEditData({ name: data.name || '', bio: data.bio || '' });

      // Check following status if not self
      if (data.id !== currentUser?.id && currentUser?.id) {
        const { data: following } = await api.get(`/social/following/${currentUser.id}`);
        setIsFollowing(following.some((f: any) => f.followingId === data.id));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, [urlUserId, currentUser?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async () => {
    try {
      const { data } = await api.patch('/auth/update', editData);
      setProfileUser({ ...profileUser, ...data });
      if (isSelf) setUser({ ...currentUser, ...data });
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    
    // Optimistic Update
    const prevFollowing = isFollowing;
    const prevFollowers = profileUser._count.followers;
    
    setIsFollowing(!isFollowing);
    setProfileUser({
      ...profileUser,
      _count: {
        ...profileUser._count,
        followers: isFollowing ? prevFollowers - 1 : prevFollowers + 1
      }
    });

    try {
      if (prevFollowing) {
        await api.delete(`/social/unfollow/${profileUser.id}`);
      } else {
        await api.post('/social/follow', { userId: profileUser.id });
      }
    } catch (error) {
      console.error('Follow toggle failed:', error);
      // Rollback on error
      setIsFollowing(prevFollowing);
      setProfileUser({
        ...profileUser,
        _count: {
          ...profileUser._count,
          followers: prevFollowers
        }
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    if (type === 'avatar') setIsUploading(true);
    else setIsUploadingCover(true);

    try {
      // 1. Upload to storage
      const uploadRes = await api.post('/storage/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const mediaId = uploadRes.data.id;
      const mediaUrl = uploadRes.data.path;

      // 2. Set as profile/cover
      const endpoint = type === 'avatar' ? '/storage/set-profile' : '/storage/set-cover';
      await api.post(endpoint, { mediaId });
      
      const updatedProfile = { ...profileUser, [type === 'avatar' ? 'avatar' : 'coverPhoto']: mediaUrl };
      setProfileUser(updatedProfile);
      if (isSelf) setUser({ ...currentUser, ...updatedProfile });
    } catch (error) {
      console.error(`${type} upload failed:`, error);
    } finally {
      setIsUploading(false);
      setIsUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { id: '1', title: 'Daily Reward', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', path: '/daily-reward' },
    { id: '2', title: 'Leaderboard', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10', path: '/leaderboard' },
    { id: '3', title: 'Vault Access', icon: Wallet, color: 'text-indigo-500', bg: 'bg-indigo-500/10', path: '/wallet' },
    { id: '4', title: 'Partner Zone', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10', extra: 'Connect' },
    { id: '5', title: 'Outfits', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: '/store' },
    { id: '6', title: 'Creator Studio', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-600/10', path: '/creator' },
    { id: '7', title: 'Griddy Luck', icon: Trophy, color: 'text-cyan-500', bg: 'bg-cyan-500/10', path: '/griddy' },
    { id: '8', title: 'Settings', icon: Settings, color: 'text-slate-500', bg: 'bg-slate-500/10', path: '/settings' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
      {/* Premium Header / Cover Photo */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-64 md:h-80 rounded-[3rem] overflow-hidden group shadow-2xl"
      >
        <img 
          src={profileUser?.coverPhoto || 'https://images.unsplash.com/photo-1614850523296-d8c1af03d400?auto=format&fit=crop&q=80&w=2070'} 
          className="w-full h-full object-cover"
          alt="Cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {isSelf && (
          <button 
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
          >
            {isUploadingCover ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          </button>
        )}
        <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />

        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group/avatar">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] border-4 border-indigo-500/30 overflow-hidden shadow-2xl relative bg-slate-900">
                <img 
                  src={profileUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser?.id}`} 
                  className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-20' : 'opacity-100'}`}
                  alt="Avatar"
                />
                {isSelf && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm"
                  >
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-indigo-600 border-4 border-slate-950 flex items-center justify-center shadow-xl">
                 <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                {profileUser?.name}
                {profileUser?.svipLevel > 0 && <Crown className="w-6 h-6 text-amber-500" />}
              </h2>
              <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">UID: {profileUser?.shortId}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {isSelf ? (
              <>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
                <button onClick={logout} className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleFollowToggle}
                  className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-xl ${
                    isFollowing 
                      ? 'bg-slate-800 text-slate-300 border border-white/5' 
                      : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500'
                  }`}
                >
                  {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button 
                  onClick={() => navigate('/messages')}
                  className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all">
                  <Share2 className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Info */}
        <div className="space-y-8">
          <section className="glass-card p-8 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-2xl border-white/5">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Broadcast Signal</h3>
            {isEditing ? (
              <div className="space-y-4">
                <input 
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500"
                  placeholder="Display Name"
                />
                <textarea 
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-xl p-4 text-slate-300 text-sm focus:ring-1 focus:ring-indigo-500 h-24 resize-none"
                  placeholder="Bio..."
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateProfile} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-black">SAVE</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-black">CANCEL</button>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 font-medium leading-relaxed italic border-l-2 border-indigo-500/40 pl-4">
                "{profileUser?.bio || 'Establishing connection... signal silent.'}"
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { label: 'Followers', value: profileUser?._count?.followers },
                { label: 'Following', value: profileUser?._count?.following },
                { label: 'Intelligence', value: `Lv. ${profileUser?.level}` },
                { label: 'Reputation', value: 'Prime' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-3xl border border-white/5">
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {isSelf && (
            <section className="space-y-4">
              <AppLink to="/wallet" className="flex items-center justify-between p-6 glass-card rounded-3xl border-white/5 bg-slate-900/40 hover:border-indigo-500/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">{profileUser?.coins || 0}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Credits</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </AppLink>
              <AppLink to="/wallet" className="flex items-center justify-between p-6 glass-card rounded-3xl border-white/5 bg-slate-900/40 hover:border-indigo-500/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10">
                    <Gem className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">{profileUser?.diamonds || 0}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Gems</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </AppLink>
            </section>
          )}
        </div>

        {/* Right Column: Menu / Social */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Status */}
          {profileUser?.rooms?.length > 0 && (
            <section className="glass-card p-8 rounded-[2.5rem] bg-indigo-600/10 border-indigo-500/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] pointer-events-none" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                    <Flame className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Currently Transmitting</h4>
                    <p className="text-indigo-400 font-bold text-sm">Room: {profileUser.rooms[0].title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/room/${profileUser.rooms[0].id}`)}
                  className="px-8 py-3 bg-white text-indigo-600 font-black rounded-2xl hover:scale-105 transition-all shadow-xl"
                >
                  JOIN SIGNAL
                </button>
              </div>
            </section>
          )}

          {/* Menu Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <AppLink 
                key={item.id} 
                to={item.path || '#'}
                className="glass-card p-6 rounded-[2rem] border-white/5 hover:bg-white/5 transition-all group text-center md:text-left"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} mb-4 mx-auto md:mx-0 border border-white/5`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-tight group-hover:text-indigo-400">{item.title}</h3>
              </AppLink>
            ))}
          </div>

          {/* Achievements / Ranks */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-card p-8 rounded-[2.5rem] bg-slate-900/40 border-white/5 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                   <Crown className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-white font-black">Aristocracy {profileUser?.aristocracyLevel || 0}</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Peer Identity Rank</p>
                </div>
             </div>
             <div className="glass-card p-8 rounded-[2.5rem] bg-slate-900/40 border-white/5 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                   <Gem className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-white font-black">SVIP Tier {profileUser?.svipLevel || 0}</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Signal Status</p>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};
