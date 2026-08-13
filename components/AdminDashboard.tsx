
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, Book, Ban, ShieldCheck, TrendingUp, Activity, Terminal, Lock, LogIn, UserPlus, KeyRound, Copy, PauseCircle, PlayCircle, XCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { trackEvent } from '../services/analytics';
import { useAuth } from '../contexts/AuthContext';
import { createCollaborator, fetchAdminReferralReport, setCollaboratorStatus, type AdminReferralRow, type IssuedCollaboratorKey } from '../services/referralService';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { profile: authProfile } = useAuth();
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
  const [referralRows, setReferralRows] = useState<AdminReferralRow[]>([]);
  const [referralError, setReferralError] = useState('');
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorName, setCollaboratorName] = useState('');
  const [collaboratorTermEnd, setCollaboratorTermEnd] = useState('');
  const [creatingCollaborator, setCreatingCollaborator] = useState(false);
  const [issuedCollaboratorKey, setIssuedCollaboratorKey] = useState<IssuedCollaboratorKey | null>(null);
  const [collaboratorManagementError, setCollaboratorManagementError] = useState('');
  const [updatingCollaboratorId, setUpdatingCollaboratorId] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated in this session
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
      fetchAdminData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@magenyi' && password === 'magenyi123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      fetchAdminData();
    } else {
      setError('Invalid admin credentials');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Local storage data
      const savedUsers = JSON.parse(localStorage.getItem('waExamPrep_users') || '[]');
      setUsers(savedUsers);
      const savedUsage = JSON.parse(localStorage.getItem('waExamPrep_global_usage') || '{}');
      setGlobalUsage(savedUsage);

      // Backend data (Secured with Basic Auth)
      const credentials = btoa('admin@magenyi:magenyi123');
      const response = await fetch('/api/admin/logs', {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setStats(data.stats || {});
        setFeatureUsage(data.featureUsage || {});
      }

      if (authProfile?.role === 'ADMIN') {
        try {
          setReferralError('');
          setReferralRows(await fetchAdminReferralReport());
        } catch (referralErr) {
          console.error('Failed to fetch referral report:', referralErr);
          setReferralError('Referral report unavailable. Apply the Supabase referral migration.');
        }
      } else {
        setReferralRows([]);
        setReferralError('Sign in with the protected Supabase admin account to view referral totals.');
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

  const handleCreateCollaborator = async (event: React.FormEvent) => {
    event.preventDefault();
    if (authProfile?.role !== 'ADMIN') {
      setCollaboratorManagementError('Only the protected Supabase admin account can issue collaborator keys.');
      return;
    }
    setCreatingCollaborator(true);
    setCollaboratorManagementError('');
    try {
      const issued = await createCollaborator({
        email: collaboratorEmail,
        displayName: collaboratorName,
        termEnd: collaboratorTermEnd || undefined,
      });
      setIssuedCollaboratorKey(issued);
      setCollaboratorEmail('');
      setCollaboratorName('');
      setCollaboratorTermEnd('');
      await fetchAdminData();
    } catch (error) {
      setCollaboratorManagementError(error instanceof Error ? error.message : 'Could not create the collaborator key.');
    } finally {
      setCreatingCollaborator(false);
    }
  };

  const handleCollaboratorStatus = async (collaboratorId: string, status: 'ACTIVE' | 'PAUSED' | 'ENDED') => {
    if (authProfile?.role !== 'ADMIN') return;
    setUpdatingCollaboratorId(collaboratorId);
    setCollaboratorManagementError('');
    try {
      await setCollaboratorStatus(collaboratorId, status);
      await fetchAdminData();
    } catch (error) {
      setCollaboratorManagementError(error instanceof Error ? error.message : 'Could not update collaborator status.');
    } finally {
      setUpdatingCollaboratorId(null);
    }
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

      <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2"><Users className="w-6 h-6 text-primary-600" /> Referral Sign-ups</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Student accounts attributed to each collaborator key.</p>
          </div>
          <div className="bg-primary-50 text-primary-700 px-5 py-3 rounded-2xl">
            <div className="text-[10px] font-black uppercase tracking-widest">Overall sign-ups</div>
            <div className="text-3xl font-black">{referralRows[0]?.overall_signups ?? 0}</div>
          </div>
        </div>
        {referralError && <p className="text-amber-700 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-xs font-bold mb-4">{referralError}</p>}
        {referralRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Collaborator</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Key</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Student sign-ups</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {referralRows.map((row) => (
                  <tr key={row.collaborator_id}>
                    <td className="px-4 py-4 font-bold text-gray-900">{row.display_name}</td>
                    <td className="px-4 py-4 text-xs font-mono text-gray-500">••••{row.referral_key_hint}</td>
                    <td className="px-4 py-4 text-right text-xl font-black text-primary-600">{row.total_signups}</td>
                    <td className="px-4 py-4"><span className={`text-[10px] font-black uppercase ${row.status === 'ACTIVE' ? 'text-emerald-700' : row.status === 'PAUSED' ? 'text-amber-700' : 'text-gray-400'}`}>{row.status}</span></td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {row.status !== 'ACTIVE' && <button type="button" disabled={updatingCollaboratorId === row.collaborator_id} onClick={() => void handleCollaboratorStatus(row.collaborator_id, 'ACTIVE')} className="p-2 rounded-xl bg-emerald-50 text-emerald-700 disabled:opacity-50" title="Activate"><PlayCircle className="w-4 h-4" /></button>}
                        {row.status === 'ACTIVE' && <button type="button" disabled={updatingCollaboratorId === row.collaborator_id} onClick={() => void handleCollaboratorStatus(row.collaborator_id, 'PAUSED')} className="p-2 rounded-xl bg-amber-50 text-amber-700 disabled:opacity-50" title="Pause"><PauseCircle className="w-4 h-4" /></button>}
                        {row.status !== 'ENDED' && <button type="button" disabled={updatingCollaboratorId === row.collaborator_id} onClick={() => void handleCollaboratorStatus(row.collaborator_id, 'ENDED')} className="p-2 rounded-xl bg-red-50 text-red-700 disabled:opacity-50" title="End"><XCircle className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 font-medium italic">No collaborator sign-ups recorded yet.</p>
        )}
      </section>

      {authProfile?.role === 'ADMIN' && (
        <section className="bg-slate-50 p-8 rounded-[40px] border border-primary-100 shadow-sm mb-12">
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-primary-100 text-primary-700 p-3 rounded-2xl"><UserPlus className="w-5 h-5" /></div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Manage collaborators</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">The collaborator must register an account first. The raw key is shown only once.</p>
            </div>
          </div>
          <form onSubmit={handleCreateCollaborator} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <label className="block">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered email</span>
              <input type="email" required value={collaboratorEmail} onChange={(event) => setCollaboratorEmail(event.target.value)} placeholder="collaborator@email.com" className="mt-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500" />
            </label>
            <label className="block">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Display name</span>
              <input type="text" required minLength={2} value={collaboratorName} onChange={(event) => setCollaboratorName(event.target.value)} placeholder="Sis School Tips" className="mt-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500" />
            </label>
            <label className="block">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Term end (optional)</span>
              <input type="date" value={collaboratorTermEnd} onChange={(event) => setCollaboratorTermEnd(event.target.value)} className="mt-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500" />
            </label>
            <button type="submit" disabled={creatingCollaborator} className="h-[50px] px-5 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <KeyRound className="w-4 h-4" /> {creatingCollaborator ? 'GENERATING…' : 'GENERATE KEY'}
            </button>
          </form>
          {collaboratorManagementError && <p className="text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-xs font-bold mt-4">{collaboratorManagementError}</p>}
          {issuedCollaboratorKey && (
            <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-emerald-700 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-black text-emerald-900">Save this referral key now</p>
                  <p className="text-xs text-emerald-800 mt-1">It will not be shown again after you close this message.</p>
                  <code className="block mt-3 bg-white border border-emerald-200 rounded-2xl px-4 py-3 text-lg font-black tracking-widest text-gray-900 break-all">{issuedCollaboratorKey.referral_key}</code>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button type="button" onClick={() => void navigator.clipboard?.writeText(issuedCollaboratorKey.referral_key)} className="px-4 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-black text-emerald-800 flex items-center gap-2"><Copy className="w-4 h-4" /> COPY KEY</button>
                    <button type="button" onClick={() => setIssuedCollaboratorKey(null)} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black">I HAVE SAVED IT</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

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
                        {user.email !== 'admin@magenyi' && (
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
