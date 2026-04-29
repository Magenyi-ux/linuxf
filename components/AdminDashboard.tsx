
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, Book, Ban, ShieldCheck, TrendingUp, Activity, Terminal, Lock, LogIn } from 'lucide-react';
import { UserProfile } from '../types';
import { trackEvent } from '../services/analytics';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [users, setUsers] = useState<(UserProfile & { password?: string })[]>([]);
  const [globalUsage, setGlobalUsage] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [featureUsage, setFeatureUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated in this session
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    const credentials = sessionStorage.getItem('admin_credentials');
    if (isAuth && credentials) {
      setIsAuthenticated(true);
      fetchAdminData(credentials);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credentials = btoa(`${email.trim()}:${password.trim()}`);
      const response = await fetch('/api/admin/logs', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_credentials', credentials);
        fetchAdminData(credentials);
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async (credentials?: string) => {
    const authCreds = credentials || sessionStorage.getItem('admin_credentials');
    if (!authCreds) return;

    setLoading(true);
    try {
      // Local storage data
      const savedUsers = JSON.parse(localStorage.getItem('waExamPrep_users') || '[]');
      setUsers(savedUsers);
      const savedUsage = JSON.parse(localStorage.getItem('waExamPrep_global_usage') || '{}');
      setGlobalUsage(savedUsage);

      // Backend data (Secured with Basic Auth)
      const response = await fetch('/api/admin/logs', {
        headers: {
          'Authorization': `Basic ${authCreds}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setStats(data.stats || {});
        setFeatureUsage(data.featureUsage || {});
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = (email: string) => {
    let newStatus = false;
    const updatedUsers = users.map(u => {
      if (u.email === email) {
        newStatus = !u.isBanned;
        return { ...u, isBanned: newStatus };
      }
      return u;
    });

    trackEvent(newStatus ? 'user_banned' : 'user_unbanned', { targetEmail: email });

    setUsers(updatedUsers);
    localStorage.setItem('waExamPrep_users', JSON.stringify(updatedUsers));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl max-w-md w-full">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary-600 p-4 rounded-3xl text-white mb-4 shadow-lg shadow-primary-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Admin Access</h2>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-2">Protected Area</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium"
                placeholder="admin@magenyi"
                required
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            <button
              type="submit"
              className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" /> SIGN IN
            </button>
          </form>

          <button onClick={onBack} className="w-full mt-6 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const totalTimeSpent = users.reduce((acc, u) => acc + (u.timeSpent || 0), 0);
  const mostUsedBooks = Object.entries(globalUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <button onClick={fetchAdminData} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-black hover:bg-primary-50 hover:text-primary-600 transition-all">
          REFRESH DATA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Users</h3>
              <p className="text-3xl font-black text-gray-900">{totalUsers}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Platform Time</h3>
              <p className="text-3xl font-black text-gray-900">{formatTime(totalTimeSpent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Most Used Packs
          </h3>
          <div className="space-y-4">
            {mostUsedBooks.length === 0 ? (
              <p className="text-gray-400 font-medium italic">No usage data yet</p>
            ) : (
              mostUsedBooks.map(([title, count]) => (
                <div key={title} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">{title}</span>
                  <span className="text-xs font-black bg-primary-50 text-primary-600 px-3 py-1 rounded-full">{count} plays</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Feature Usage (Real-time)
          </h3>
          <div className="space-y-4">
            {Object.keys(featureUsage).length === 0 ? (
              <p className="text-gray-400 font-medium italic">Waiting for events...</p>
            ) : (
              Object.entries(featureUsage).map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700 capitalize">{name.replace('_', ' ')}</span>
                  <span className="text-xs font-black bg-green-50 text-green-600 px-3 py-1 rounded-full">{count}</span>
                </div>
              ))
            )}
            {stats.total_questions && (
               <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span className="text-sm font-bold text-gray-900">Total AI Questions</span>
                  <span className="text-sm font-black text-primary-600">{stats.total_questions}</span>
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <section>
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" />
            User Management
          </h3>
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.email} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900 text-sm">{user.name || 'Anonymous'}</div>
                        <div className="text-[10px] text-gray-400">{user.email}</div>
                      </td>
                      <td className="px-6 py-5">
                        {user.isBanned ? (
                          <span className="text-red-600 text-[10px] font-black uppercase">Banned</span>
                        ) : (
                          <span className="text-green-600 text-[10px] font-black uppercase">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {user.email !== (import.meta.env.VITE_ADMIN_EMAIL || 'admin@magenyi') && (
                          <button
                            onClick={() => toggleBan(user.email!)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                              user.isBanned
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {user.isBanned ? 'UNBAN' : 'BAN'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-gray-900" />
            Live Event Stream
          </h3>
          <div className="bg-gray-900 rounded-[40px] p-6 shadow-2xl h-[400px] overflow-y-auto sidebar-scrollbar font-mono text-[11px]">
            {events.length === 0 ? (
              <p className="text-gray-500 italic">No events captured yet...</p>
            ) : (
              <div className="space-y-3">
                {events.map((ev, i) => (
                  <div key={i} className="border-l-2 border-primary-500 pl-3 py-1">
                    <div className="flex items-center justify-between text-gray-500 mb-1">
                      <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      <span className="text-primary-400 font-bold">{ev.event}</span>
                    </div>
                    <div className="text-gray-300">
                      <span className="text-amber-400">{ev.email || 'anon'}</span>: {JSON.stringify(ev.data)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
