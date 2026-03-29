import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- Types ---

interface Stats {
  userCount: number;
  roomCount: number;
  familyCount: number;
  totalRevenue: number;
}

interface Analytics {
  overview: {
    totalUsers: number;
    activeRooms: number;
    totalRevenue: number;
    pendingWithdrawalAmount: number;
    growth: {
      newUsers7d: number;
      revenue7d: number;
    };
  };
  activity: {
    topRooms: any[];
    recentTransactions: any[];
  };
}

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
}

const PACKAGES = [
  { price: 0.99, coins: 2000 },
  { price: 4.99, coins: 9000 },
  { price: 9.99, coins: 19000 },
  { price: 19.99, coins: 40000 },
  { price: 49.99, coins: 90000 },
  { price: 99.99, coins: 200000 },
];

// --- Icons (SVGs for maximum compatibility) ---

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

const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const DollarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Authentication ---

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
        localStorage.setItem('admin_token', String(data.token));
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
      <div className="w-full max-w-md relative z-10 transition-all duration-700 animate-in fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-500/20 mb-8">
            <ShieldIcon className="text-white w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Protocol Console</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Backend Gateway</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl">
                {String(errorMsg)}
              </div>
            )}
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">Identity UID (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(String(e.target.value))}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 font-bold"
                placeholder="admin@onchat.fun"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">Security Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(String(e.target.value))}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-5 px-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700 font-bold"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] mt-4 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
            >
              {loading ? 'INITIALIZING...' : 'VERIFY HANDSHAKE'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard ---

const StatCard = ({ title, value, color, icon: Icon, subValue }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group">
    <div className="flex justify-between items-start mb-8">
      <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center p-3`}>
        <Icon className={`w-full h-full text-${color.split('-')[1]}-600`} />
      </div>
      {subValue && <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+{subValue} Today</div>}
    </div>
    <div>
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-950 tracking-tighter tabular-nums">{String(value || 0)}</p>
    </div>
  </div>
);

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ userCount: 0, roomCount: 0, familyCount: 0, totalRevenue: 0 });
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUserForCoins, setSelectedUserForCoins] = useState<User | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async (useToken?: string) => {
    const activeToken = useToken || token;
    if (!activeToken) return;
    
    try {
      const headers = { 'Authorization': `Bearer ${activeToken}` };
      const statsRes = await fetch('https://api.onchat.fun/api/admin/stats', { headers });
      const usersRes = await fetch('https://api.onchat.fun/api/admin/users', { headers });
      const analyticsRes = await fetch('https://api.onchat.fun/api/admin/analytics', { headers });
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      
      if (statsRes.status === 401 || usersRes.status === 401) logout();
    } catch (e) {
      console.error('Fetch fail');
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (userId: string, type: string, currentAmount: number) => {
    const amountStr = prompt(`Set total ${type}:`, currentAmount.toString());
    if (amountStr === null) return;
    const amount = parseInt(amountStr);
    if (isNaN(amount)) return alert('Invalid Input');
    
    try {
      const res = await fetch(`https://api.onchat.fun/api/admin/users/${userId}/balance`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [type]: amount })
      });
      if (res.ok) fetchData();
      else alert('Node Rejection');
    } catch (e) {
      alert('Network Rejection');
    }
  };

  const toggleReseller = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`https://api.onchat.fun/api/admin/users/${userId}/reseller`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isReseller: !currentStatus })
      });
      if (res.ok) fetchData();
      else alert('Permission Denied');
    } catch (e) {
      alert('Network Rejection');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  const filteredUsers = users.filter(user => 
    String(user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(user.shortId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!token) return <Login onLogin={(t) => { setToken(t); fetchData(t); }} />;
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans antialiased text-slate-900 overflow-x-hidden selection:bg-indigo-100">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200/50 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-10 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-14 px-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200">
              <ShieldIcon className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tighter leading-none mb-1">Onchat</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mainnet Node</p>
            </div>
          </div>

          <nav className="space-y-3">
             <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${activeTab === 'users' ? 'bg-slate-950 text-white shadow-xl shadow-slate-300' : 'text-slate-400 hover:bg-slate-50'}`}>
                <UserIcon className="w-5 h-5" />
                Directory
             </button>
             <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${activeTab === 'stats' ? 'bg-slate-950 text-white shadow-xl shadow-slate-300' : 'text-slate-400 hover:bg-slate-50'}`}>
                <GridIcon className="w-5 h-5" />
                Network Stats
             </button>
          </nav>

          <div className="mt-auto pt-10 border-t border-slate-50">
            <button onClick={logout} className="flex items-center gap-4 w-full px-6 py-4 text-slate-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-colors">
              <LogOutIcon className="w-5 h-5" />
              Sever Connection
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-3xl border-b border-slate-200/50 h-28 flex items-center justify-between px-12 sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-8 flex-1 max-w-xl">
             <div className="relative flex-1 group">
               <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
               <input 
                type="text" 
                placeholder="Query entities or nodes..." 
                className="w-full bg-slate-100/50 border-none rounded-[1.5rem] py-5 pl-16 pr-8 text-sm focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(String(e.target.value))}
               />
             </div>
          </div>
          <div className="flex items-center gap-8">
             <button onClick={() => fetchData()} className="w-14 h-14 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all active:rotate-180">
                <RefreshIcon className="w-6 h-6" />
             </button>
             <div className="flex items-center gap-4">
               <div className="text-right">
                 <p className="text-sm font-black text-slate-950 uppercase tracking-widest leading-none mb-1">Terminal_Root</p>
                 <div className="flex items-center justify-end gap-1.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</p>
                 </div>
               </div>
               <div className="w-16 h-16 rounded-3xl bg-slate-950 text-white flex items-center justify-center font-black shadow-2xl shadow-indigo-200">OC</div>
             </div>
          </div>
        </header>

        <div className="p-12 space-y-12">
          {activeTab === 'stats' ? (
            <div className="space-y-12">
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                 <StatCard title="Entity Count" value={analytics?.overview.totalUsers || stats.userCount} icon={UserIcon} color="bg-blue-600" subValue={analytics?.overview.growth.newUsers7d} />
                 <StatCard title="Active Segments" value={analytics?.overview.activeRooms || stats.roomCount} icon={GridIcon} color="bg-purple-600" />
                 <StatCard title="Group Clusters" value={stats.familyCount?.toLocaleString()} icon={UserIcon} color="bg-pink-600" />
                 <StatCard title="Total Flow" value={`$${(analytics?.overview.totalRevenue || stats.totalRevenue)?.toLocaleString()}`} icon={DollarIcon} color="bg-emerald-600" subValue={analytics?.overview.growth.revenue7d} />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Growth Chart */}
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">User Growth Trend</h3>
                    <div className="w-full h-[80%]">
                      {/* @ts-ignore */}
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: 'Mon', users: 120 }, { name: 'Tue', users: 150 }, { name: 'Wed', users: 180 }, 
                          { name: 'Thu', users: 220 }, { name: 'Fri', users: 260 }, { name: 'Sat', users: 310 }, { name: 'Sun', users: 380 }
                        ]}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                          <Tooltip />
                          <Area type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Revenue Momentum</h3>
                    <div className="w-full h-[80%]">
                      {/* @ts-ignore */}
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { name: 'Mon', rev: 400 }, { name: 'Tue', rev: 300 }, { name: 'Wed', rev: 600 }, 
                          { name: 'Thu', rev: 800 }, { name: 'Fri', rev: 500 }, { name: 'Sat', rev: 900 }, { name: 'Sun', rev: 1200 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                          <Tooltip />
                          <Line type="monotone" dataKey="rev" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-[3.5rem] border border-slate-200/40 shadow-sm overflow-hidden">
              <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight">Entity Directory</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Full Cluster Synchronization</p>
                </div>
                <div className="px-6 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  {filteredUsers.length} Results
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#fbfcff]">
                    <tr>
                      <th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Identity Link</th>
                      <th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Asset Index</th>
                      <th className="px-12 py-8 text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] text-right">Command</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map((user) => (
                      <tr key={String(user.id)} className="hover:bg-indigo-50/20 transition-all group">
                        <td className="px-12 py-10">
                          <div className="flex items-center gap-8">
                            <div className="h-20 w-20 rounded-[2rem] bg-white border-4 border-slate-100 flex items-center justify-center overflow-hidden shadow-2xl shadow-indigo-100 group-hover:scale-105 transition-transform">
                               <img 
                                className="w-full h-full object-cover"
                                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${String(user.email || 'onchat')}`} 
                                alt="" 
                               />
                            </div>
                            <div>
                              <div className="text-2xl font-black text-slate-950 leading-none mb-3">{String(user.name)}</div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-widest">{String(user.shortId)}</span>
                                <span className="text-xs font-bold text-slate-400">{String(user.email)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-12 py-10">
                            <div className="flex gap-12">
                              <div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Coins</p>
                                <p className="text-2xl font-black text-indigo-600 tabular-nums">{user.coins?.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Diamonds</p>
                                <p className="text-2xl font-black text-pink-500 tabular-nums">{user.diamonds?.toLocaleString()}</p>
                              </div>
                            </div>
                        </td>
                        <td className="px-12 py-10 text-right">
                          <div className="flex justify-end items-center gap-4">
                            <button 
                              onClick={() => setSelectedUserForCoins(user)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest px-8 py-4.5 rounded-2xl transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200"
                            >
                              Add Assets
                            </button>
                            <button 
                              onClick={() => updateBalance(user.id, 'coins', user.coins)}
                              className="w-14 h-14 bg-slate-50 border border-slate-100 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                            >
                              <RefreshIcon className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => toggleReseller(user.id, !!user.isReseller)}
                              className={`w-14 h-14 border flex items-center justify-center rounded-2xl transition-all shadow-sm ${user.isReseller ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                            >
                              <ShieldIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Asset Modal */}
      {selectedUserForCoins && (
        <CoinSellerModal 
          user={selectedUserForCoins} 
          token={token || ''}
          onClose={() => setSelectedUserForCoins(null)} 
          onSuccess={() => fetchData()} 
        />
      )}
    </div>
  );
};

// --- Sub-Components ---

const CoinSellerModal = ({ user, token, onClose, onSuccess }: { user: User; token: string; onClose: () => void; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [customVal, setCustomVal] = useState('');

  const handleSell = async (amount: number, usd: number) => {
    if (!confirm(`Commit credit of ${amount.toLocaleString()} assets for $${usd}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.onchat.fun/api/admin/users/${user.id}/add-coins`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Transaction Rejected');
      }
    } catch (e) {
      alert('Network Rejection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/40 backdrop-blur-2xl animate-in fade-in">
      <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/50 animate-in zoom-in-95">
        <div className="flex justify-between items-center p-14 pb-0">
          <div>
            <h3 className="text-4xl font-black tracking-tighter text-slate-950 mb-2">Asset Pipeline</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Target: <span className="text-indigo-600">{String(user.name)}</span></p>
          </div>
          <button onClick={onClose} className="w-16 h-16 flex items-center justify-center text-slate-300 hover:text-slate-950 bg-slate-50 rounded-3xl transition-all">
            <XIcon className="w-8 h-8" />
          </button>
        </div>

        <div className="p-14">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-12">
            {PACKAGES.map((pkg, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => handleSell(pkg.coins, pkg.price)}
                className="flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-indigo-600 group rounded-[2.5rem] transition-all duration-500 disabled:opacity-50"
              >
                <div className="text-2xl font-black text-slate-950 group-hover:text-white tabular-nums mb-2">{pkg.coins.toLocaleString()}</div>
                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 group-hover:text-indigo-200">Asset Pack</div>
                <div className="px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black group-hover:bg-indigo-500 group-hover:text-white transition-all text-slate-600">${pkg.price}</div>
              </button>
            ))}
          </div>

          <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 text-center font-mono">Custom Value Injection</h4>
            <div className="flex flex-col sm:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">USD Value</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-2xl">$</span>
                  <input
                    type="number"
                    value={customVal}
                    onChange={(e) => setCustomVal(String(e.target.value))}
                    placeholder="100.00"
                    className="w-full pl-12 pr-6 py-6 bg-white border-4 border-transparent focus:border-indigo-600 rounded-[1.5rem] font-black text-slate-950 text-2xl outline-none shadow-sm transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSell(Math.floor(parseFloat(customVal) * 2000), parseFloat(customVal))} 
                disabled={loading || !customVal}
                className="w-full sm:w-auto px-10 py-7 bg-slate-950 text-white font-black rounded-[1.5rem] hover:bg-indigo-600 transition-all uppercase tracking-widest text-[10px]"
              >
                Inject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
