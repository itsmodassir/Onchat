import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- Types ---

interface User {
  id: string;
  name: string;
  email: string;
  shortId: string;
  avatar?: string;
  coins: number;
  diamonds: number;
  crystals: number;
  isReseller?: boolean;
  isBanned?: boolean;
  bio?: string;
}

interface Stats {
  userCount: number;
  roomCount: number;
  familyCount: number;
  agencyCount: number;
  coupleCount: number;
  totalRevenue: number;
}

interface DetailedAnalytics {
  agencies: any[];
  cpCouples: any[];
  gameLogs: any[];
  financeLogs: any[];
}

interface ActivityEvent {
  id: string;
  type: 'FINANCE' | 'GAME' | 'MODERATION' | 'SOCIAL';
  content: string;
  createdAt: string;
}

const PACKAGES = [
  { price: 0.99, coins: 2000 },
  { price: 4.99, coins: 9000 },
  { price: 9.99, coins: 19000 },
  { price: 19.99, coins: 40000 },
  { price: 49.99, coins: 90000 },
  { price: 99.99, coins: 200000 },
];

// --- Icons ---

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const AgencyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CPIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const GameIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const FinanceIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const BanIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Components ---

const Login = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('https://api.onchat.fun/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token && data.user?.isAdmin) {
        localStorage.setItem('adminToken', String(data.token));
        onLogin(data.token);
      } else {
        setErrorMsg(data.error || 'UNAUTHORIZED_ACCESS_DENIED');
      }
    } catch (e) {
      setErrorMsg('GATEWAY_TIMEOUT: PEER_OFFLINE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans text-white">
      <div className="w-full max-w-md animate-in fade-in duration-700">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-500/20 mb-8">
            <ShieldIcon className="text-white w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Protocol Console</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Backend Gateway</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl">{errorMsg}</div>}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">Identity UID</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 px-6 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" placeholder="admin@onchat.fun" required />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">Security Key</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 px-6 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50">
              {loading ? 'INITIALIZING...' : 'VERIFY HANDSHAKE'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, icon: Icon, subValue }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group">
    <div className="flex justify-between items-start mb-8">
      <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center p-3`}>
        <Icon className={`w-full h-full text-${color.split('-')[1]}-600`} />
      </div>
      {subValue && <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+{subValue} Trending</div>}
    </div>
    <div>
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-950 tracking-tighter tabular-nums">{String(value || 0)}</p>
    </div>
  </div>
);

const MenuItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${active ? 'bg-slate-950 text-white shadow-xl shadow-slate-300' : 'text-slate-400 hover:bg-slate-50'}`}>
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

const UserEditModal = ({ user, token, onClose, onSuccess }: { user: User; token: string; onClose: () => void; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ name: user.name, email: user.email, shortId: user.shortId, bio: user.bio || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`https://api.onchat.fun/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) { onSuccess(); onClose(); }
      else alert('Update Rejected');
    } catch (e) { alert('Network Rejection'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/40 backdrop-blur-2xl animate-in fade-in">
      <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/50">
        <div className="p-14">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black">Identity Calibration</h3>
            <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-2xl transition-all"><XIcon className="w-6 h-6" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</label><input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ShortID</label><input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold" value={formData.shortId} onChange={e => setFormData({...formData, shortId: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Vector</label><input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity Bio</label><textarea rows={3} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} /></div>
            <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-950 transition-all">{loading ? 'SYNCHRONIZING...' : 'ESTABLISH CHANGES'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

const CoinSellerModal = ({ user, token, onClose, onSuccess }: { user: User; token: string; onClose: () => void; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [customVal, setCustomVal] = useState('');

  const handleSell = async (amount: number, usd: number) => {
    if (!confirm(`Commit credit of ${amount.toLocaleString()} assets for $${usd}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.onchat.fun/api/admin/users/${user.id}/add-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount })
      });
      if (res.ok) { onSuccess(); onClose(); }
      else alert('Transaction Rejected');
    } catch (e) { alert('Network Rejection'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/40 backdrop-blur-2xl animate-in fade-in">
      <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/50 animate-in zoom-in-95">
        <div className="flex justify-between items-center p-14 pb-0">
          <div><h3 className="text-4xl font-black text-slate-950 mb-2">Asset Pipeline</h3><p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Target: <span className="text-indigo-600">{user.name}</span></p></div>
          <button onClick={onClose} className="w-16 h-16 flex items-center justify-center text-slate-300 hover:text-slate-950 bg-slate-50 rounded-3xl transition-all"><XIcon className="w-8 h-8" /></button>
        </div>
        <div className="p-14">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-12">
            {PACKAGES.map((pkg, i) => (
              <button key={i} onClick={() => handleSell(pkg.coins, pkg.price)} className="flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-indigo-600 group rounded-[2.5rem] transition-all duration-500">
                <div className="text-2xl font-black text-slate-950 group-hover:text-white tabular-nums mb-2">{pkg.coins.toLocaleString()}</div>
                <div className="px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black group-hover:bg-indigo-500 group-hover:text-white text-slate-600">${pkg.price}</div>
              </button>
            ))}
          </div>
          <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 flex gap-6 items-end">
            <div className="flex-1"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Inject Custom USD</label><input type="number" value={customVal} onChange={(e) => setCustomVal(e.target.value)} className="w-full px-6 py-5 bg-white border-2 border-transparent focus:border-indigo-600 rounded-[1.2rem] outline-none font-black text-xl" placeholder="100.00" /></div>
            <button onClick={() => handleSell(Math.floor(parseFloat(customVal) * 2000), parseFloat(customVal))} disabled={!customVal} className="px-10 py-6 bg-slate-950 text-white font-black rounded-[1.2rem] hover:bg-indigo-600 transition-all uppercase tracking-widest text-[10px]">Inject</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ userCount: 0, roomCount: 0, familyCount: 0, agencyCount: 0, coupleCount: 0, totalRevenue: 0 });
  const [analytics, setAnalytics] = useState<DetailedAnalytics | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForCoins, setSelectedUserForCoins] = useState<User | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [uRes, sRes, aRes, actRes] = await Promise.all([
        fetch('https://api.onchat.fun/api/admin/users', { headers }),
        fetch('https://api.onchat.fun/api/admin/stats', { headers }),
        fetch('https://api.onchat.fun/api/admin/analytics/detailed', { headers }),
        fetch('https://api.onchat.fun/api/admin/activity/stream', { headers }),
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (sRes.ok) setStats(await sRes.json());
      if (aRes.ok) setAnalytics(await aRes.json());
      if (actRes.ok) setActivity(await actRes.json());
    } catch (e) {
      console.error('Handshake Timeout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto-refresh for activity
    return () => clearInterval(interval);
  }, [token]);

  if (!token) return <Login onLogin={setToken} />;

  const logout = () => { localStorage.removeItem('adminToken'); setToken(null); };

  const handleBan = async (userId: string, isBanned: boolean) => {
    if (!confirm(`${isBanned ? 'Authorize identity suspension' : 'Resume authorization'} for candidate?`)) return;
    try {
      const res = await fetch(`https://api.onchat.fun/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isBanned })
      });
      if (res.ok) fetchData();
    } catch (e) { alert('Ban protocol failure'); }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('EXTREME WARNING: This will permanently purge the user record. This action is IRREVERSIBLE. Proceed?')) return;
    try {
      const res = await fetch(`https://api.onchat.fun/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (e) { alert('Purge protocol failure'); }
  }

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.shortId?.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderStats = () => (
    <div className="space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard title="Total Entities" value={stats.userCount} icon={UserIcon} color="bg-blue-600" subValue={12} />
        <StatCard title="Agency Clusters" value={stats.agencyCount} icon={AgencyIcon} color="bg-purple-600" />
        <StatCard title="Social Links" value={stats.coupleCount} icon={CPIcon} color="bg-pink-600" />
        <StatCard title="Net Flow" value={`$${stats.totalRevenue.toLocaleString()}`} icon={FinanceIcon} color="bg-emerald-600" subValue={8} />
      </div>
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-[400px]">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Flux Trend</h3>
        <div className="w-full h-[80%]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[{name: 'M', v: 400}, {name: 'T', v: 300}, {name: 'W', v: 600}, {name: 'T', v: 800}, {name: 'F', v: 700}, {name: 'S', v: 900}, {name: 'S', v: 1100}]}>
              <defs><linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip />
              <Area type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={3} fill="url(#colorV)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-[3.5rem] border border-slate-200/40 shadow-sm overflow-hidden text-slate-900">
      <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center">
        <div><h2 className="text-3xl font-black text-slate-950">Identity Directory</h2><p className="text-[10px] font-black text-slate-400 uppercase mt-1">Full Cluster Sync</p></div>
        <div className="px-6 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">{filteredUsers.length} Results</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50"><tr><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Entity</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Assets</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase text-right">Command Console</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-indigo-50/20 group">
                <td className="px-12 py-10 flex items-center gap-8">
                  <div className="relative">
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.shortId}`} className={`w-20 h-20 rounded-[2rem] border-4 border-slate-100 shadow-xl ${u.isBanned ? 'grayscale opacity-50' : ''}`} />
                    {u.isBanned && <div className="absolute inset-0 flex items-center justify-center bg-red-600/50 rounded-[2rem] text-white text-[8px] font-black uppercase">BANNED</div>}
                  </div>
                  <div><div className="text-2xl font-black text-slate-950 mb-2">{u.name}</div><div className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase translate-y-[-2px] inline-block">{u.shortId}</div></div>
                </td>
                <td className="px-12 py-10"><div className="text-2xl font-black text-indigo-600 tabular-nums">{u.coins.toLocaleString()} <span className="text-[10px] text-slate-300 uppercase ml-2 font-black">Coins</span></div></td>
                <td className="px-12 py-10 text-right">
                  <div className="flex justify-end gap-3 translate-x-2">
                    <button onClick={() => setSelectedUserForCoins(u)} className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-slate-950 transition-all shadow-lg shadow-indigo-100" title="Add Assets"><FinanceIcon className="w-5 h-5" /></button>
                    <button onClick={() => setSelectedUserForEdit(u)} className="p-4 bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all" title="Edit Identity"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleBan(u.id, !u.isBanned)} className={`p-4 rounded-2xl transition-all ${u.isBanned ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white'}`} title={u.isBanned ? 'Re-Authorize' : 'Ban Identity'}><BanIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-4 bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white rounded-2xl transition-all" title="Purge Identity"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAgencies = () => (
    <div className="bg-white rounded-[3.5rem] border border-slate-200/40 shadow-sm overflow-hidden">
      <div className="px-12 py-10 border-b border-slate-50">
        <h2 className="text-3xl font-black text-slate-950">Agency Centers</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Host & Cluster Monitoring</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#fbfcff]"><tr><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Agency</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Owner</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Members</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Rate</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {analytics?.agencies.map(a => (
              <tr key={a.id} className="hover:bg-slate-50/50">
                <td className="px-12 py-8 font-black text-slate-950 text-xl">{a.name}</td>
                <td className="px-12 py-8">
                  <div className="font-bold text-slate-900">{a.owner.name}</div>
                  <div className="text-[10px] font-black text-indigo-600 uppercase tabular-nums">{a.owner.shortId}</div>
                </td>
                <td className="px-12 py-8 font-black text-slate-950">{a._count.members} Hosts</td>
                <td className="px-12 py-8 font-bold text-emerald-500">{a.commissionRate * 100}% Yield</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCP = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {analytics?.cpCouples.map(c => (
        <div key={c.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center group hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-6 mb-8 relative">
             <img src={c.user1.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user1.shortId}`} className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl" />
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-200 z-10 animate-pulse"><CPIcon className="w-6 h-6" /></div>
             <img src={c.user2.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user2.shortId}`} className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl" />
          </div>
          <h3 className="text-xl font-black text-slate-950 mb-2">{c.user1.name} & {c.user2.name}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Social Link Value</p>
          <div className="bg-pink-50 px-8 py-4 rounded-2xl border border-pink-100 font-black text-pink-600 text-2xl tabular-nums shadow-sm">{c.points.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );

  const renderGames = () => (
    <div className="bg-white rounded-[3.5rem] border border-slate-200/40 shadow-sm overflow-hidden">
      <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center">
        <div><h2 className="text-3xl font-black text-slate-950">Griddy Logstream</h2><p className="text-[10px] font-black text-slate-400 uppercase mt-1">Real-time Game Analytics</p></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#fbfcff]"><tr><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Player</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Stake</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Multiplier</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Result</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {analytics?.gameLogs.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/50 transition-all font-mono">
                <td className="px-12 py-8"><div className="font-black text-slate-950">{l.user.name}</div><div className="text-[10px] text-slate-400">{l.user.shortId}</div></td>
                <td className="px-12 py-8 font-black text-slate-950">{l.amount} 🪙</td>
                <td className="px-12 py-8 font-black text-indigo-600">{l.multiplier}x</td>
                <td className="px-12 py-8"><span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${l.won ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{l.won ? 'WIN' : 'LOST'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="bg-white rounded-[3.5rem] border border-slate-200/40 shadow-sm overflow-hidden">
      <div className="px-12 py-10 border-b border-slate-50"><h2 className="text-3xl font-black text-slate-950">Neural Activity Stream</h2><p className="text-[10px] font-black text-slate-400 uppercase mt-1">Real-time Platform Pulse</p></div>
      <div className="divide-y divide-slate-50 max-h-[800px] overflow-y-auto">
        {activity.map(ev => (
          <div key={ev.id} className="p-10 hover:bg-slate-50/50 flex items-center gap-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 ${
              ev.type === 'FINANCE' ? 'bg-emerald-50 text-emerald-600' :
              ev.type === 'GAME' ? 'bg-indigo-50 text-indigo-600' :
              ev.type === 'MODERATION' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
            }`}>{ev.type[0]}</div>
            <div className="flex-1"><p className="text-lg font-black text-slate-950 mb-1">{ev.content}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(ev.createdAt).toLocaleString()}</p></div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{ev.type}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFinance = () => (
    <div className="bg-white rounded-[3.5rem] border border-slate-200/40 shadow-sm overflow-hidden">
      <div className="px-12 py-10 border-b border-slate-50"><h2 className="text-3xl font-black text-slate-950">Financial Flux</h2><p className="text-[10px] font-black text-slate-400 uppercase mt-1">Asset Pipeline Tracking</p></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#fbfcff]"><tr><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Identity</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Operation</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Volume</th><th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase">Trace ID</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {analytics?.financeLogs.map(f => (
              <tr key={f.id} className="hover:bg-slate-50/50">
                <td className="px-12 py-8 font-bold text-slate-950">{f.user.name}<div className="text-[10px] font-black text-slate-400">{f.user.shortId}</div></td>
                <td className="px-12 py-8"><span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase">{f.type}</span></td>
                <td className={`px-12 py-8 font-black text-xl tabular-nums ${f.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{f.amount > 0 ? '+' : ''}{f.amount.toLocaleString()}</td>
                <td className="px-12 py-8 font-mono text-[9px] text-slate-300">{f.razorpayOrderId || f.id.slice(0, 16)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans antialiased text-slate-900 selection:bg-indigo-100">
      <aside className="w-80 bg-white border-r border-slate-200/50 hidden lg:flex flex-col sticky top-0 h-screen p-10">
        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200"><ShieldIcon className="text-white w-6 h-6" /></div>
          <div><h1 className="text-2xl font-black text-slate-950 tracking-tighter mb-1">Onchat</h1><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mainnet Node</p></div>
        </div>
        <nav className="space-y-3 flex-1 overflow-y-auto pr-2">
          <MenuItem icon={GridIcon} label="Protocol Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          <MenuItem icon={UserIcon} label="Entity Directory" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <MenuItem icon={ActivityIcon} label="Neural Activity" active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
          <MenuItem icon={AgencyIcon} label="Agency Clusters" active={activeTab === 'agencies'} onClick={() => setActiveTab('agencies')} />
          <MenuItem icon={CPIcon} label="Social Links" active={activeTab === 'cp'} onClick={() => setActiveTab('cp')} />
          <MenuItem icon={GameIcon} label="Griddy Flux" active={activeTab === 'games'} onClick={() => setActiveTab('games')} />
          <MenuItem icon={FinanceIcon} label="Finance Loop" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
        </nav>
        <div className="pt-10 border-t border-slate-50"><button onClick={logout} className="flex items-center gap-4 w-full px-6 py-4 text-slate-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-colors"><LogOutIcon className="w-5 h-5" />Sever Connection</button></div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white/80 backdrop-blur-3xl border-b border-slate-200/50 h-28 flex items-center justify-between px-12 sticky top-0 z-10">
          <div className="flex items-center gap-8 flex-1 max-w-xl">
             <div className="relative flex-1 group">
               <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
               <input type="text" placeholder="Query entity UID..." className="w-full bg-slate-100/50 border-none rounded-[1.5rem] py-5 pl-16 pr-8 text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder:text-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
          </div>
          <div className="flex items-center gap-8">
             <button onClick={fetchData} className="w-14 h-14 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all"><RefreshIcon className="w-6 h-6" /></button>
             <div className="flex items-center gap-4"><div className="text-right"><p className="text-sm font-black text-slate-950 uppercase tracking-widest mb-1">Terminal_Root</p><div className="flex items-center justify-end gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div><p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</p></div></div><div className="w-16 h-16 rounded-3xl bg-slate-950 text-white flex items-center justify-center font-black shadow-2xl shadow-indigo-200">OC</div></div>
          </div>
        </header>

        <div className="p-12 space-y-12">
          {loading && !users.length ? <div className="flex justify-center py-24"><div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div></div> : (
            <>
              {activeTab === 'stats' && renderStats()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'activity' && renderActivity()}
              {activeTab === 'agencies' && renderAgencies()}
              {activeTab === 'cp' && renderCP()}
              {activeTab === 'games' && renderGames()}
              {activeTab === 'finance' && renderFinance()}
            </>
          )}
        </div>
      </main>

      {selectedUserForCoins && <CoinSellerModal user={selectedUserForCoins} token={token || ''} onClose={() => setSelectedUserForCoins(null)} onSuccess={fetchData} />}
      {selectedUserForEdit && <UserEditModal user={selectedUserForEdit} token={token || ''} onClose={() => setSelectedUserForEdit(null)} onSuccess={fetchData} />}
    </div>
  );
};

export default App;
