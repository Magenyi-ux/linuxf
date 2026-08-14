import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Check,
  Copy,
  GraduationCap,
  KeyRound,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { trackEvent } from '../services/analytics';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import {
  FIXED_REFERRAL_CODE,
  fetchAdminReferralCodeSummary,
  type AdminReferralCodeSummary,
} from '../services/referralService';

interface AdminDashboardProps {
  onBack: () => void;
}

type AdminSection = 'OVERVIEW' | 'USERS' | 'REFERRAL';
type AdminUserRow = {
  id: string;
  display_name: string | null;
  role: string | null;
};

const roleLabel = (role: string | null | undefined): string =>
  role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STUDENT';

const roleClasses = (role: string | null | undefined): string =>
  role?.toUpperCase() === 'ADMIN'
    ? 'bg-red-50 text-red-700 border-red-100'
    : 'bg-emerald-50 text-emerald-700 border-emerald-100';

const formatId = (id: string): string => `${id.slice(0, 8)}…${id.slice(-4)}`;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { profile: authProfile } = useAuth();
  const [section, setSection] = useState<AdminSection>('OVERVIEW');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [referralSummary, setReferralSummary] = useState<AdminReferralCodeSummary>({
    code: FIXED_REFERRAL_CODE,
    total_signups: 0,
  });
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STUDENT'>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const isAdmin = authProfile?.role === 'ADMIN';

  const fetchAdminData = useCallback(async () => {
    if (!isAdmin || !isSupabaseConfigured) return;
    setLoading(true);
    setError('');
    try {
      const [summary, profileResult] = await Promise.all([
        fetchAdminReferralCodeSummary(),
        supabase
          .from('profiles')
          .select('id, display_name, role')
          .order('display_name', { ascending: true })
          .limit(1000),
      ]);

      if (profileResult.error) throw profileResult.error;
      setReferralSummary(summary);
      setUsers((profileResult.data || []) as AdminUserRow[]);
      trackEvent('admin_dashboard_refresh', { total_profiles: profileResult.data?.length || 0 });
    } catch (fetchError) {
      console.error('Failed to load admin dashboard:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Could not load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void fetchAdminData();
  }, [fetchAdminData]);

  const totalAdmins = useMemo(
    () => users.filter((user) => roleLabel(user.role) === 'ADMIN').length,
    [users],
  );

  const totalStudents = Math.max(users.length - totalAdmins, 0);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === 'ALL' || roleLabel(user.role) === roleFilter;
      const matchesQuery = !query
        || (user.display_name || '').toLowerCase().includes(query)
        || user.id.toLowerCase().includes(query);
      return matchesRole && matchesQuery;
    });
  }, [roleFilter, userSearch, users]);

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(FIXED_REFERRAL_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('The referral code could not be copied. Please select and copy it manually.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <div className="max-w-md w-full bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl text-center">
          <div className="mx-auto mb-5 w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Admin access required</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500 font-medium">
            This portal is protected by the Supabase admin role. Sign in with the approved administrator account to continue.
          </p>
          <button onClick={onBack} className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 text-sm font-black hover:bg-primary-50 hover:text-primary-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-16">
      <div className="flex items-center justify-between gap-4 mb-5">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>
        <button
          onClick={() => void fetchAdminData()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-black hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'REFRESHING…' : 'REFRESH DATA'}
        </button>
      </div>

      <section className="bg-white rounded-[28px] border border-primary-100 shadow-sm p-5 md:p-6 mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Admin Portal &amp; RBAC</h1>
              <p className="text-xs font-medium text-gray-400">Role-Based Access Control System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <Check className="w-4 h-4" /> SUPABASE ADMIN
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <AdminStatCard title="Total Users" value={users.length} color="text-primary-600" icon={<Users className="w-4 h-4" />} />
          <AdminStatCard title="Admins" value={totalAdmins} color="text-red-600" icon={<ShieldCheck className="w-4 h-4" />} />
          <AdminStatCard title="Moderators" value={0} color="text-blue-600" icon={<UserCheck className="w-4 h-4" />} />
          <AdminStatCard title="Students" value={totalStudents} color="text-emerald-600" icon={<GraduationCap className="w-4 h-4" />} />
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto pb-1 mb-5" aria-label="Admin sections">
        {([
          ['OVERVIEW', 'Overview', Activity],
          ['USERS', 'Users', Users],
          ['REFERRAL', 'Referral', Share2],
        ] as const).map(([value, label, Icon]) => (
          <button
            key={value}
            onClick={() => setSection(value)}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-colors ${section === value ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white text-gray-500 border border-gray-100 hover:border-primary-200 hover:text-primary-700'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold">
          <span className="mt-0.5">!</span>
          <span>{error}</span>
        </div>
      )}

      {section === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-primary-50 text-primary-600"><Share2 className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Referral sign-ups</h2>
                <p className="text-xs text-gray-500 font-medium">Overall student sign-ups using the approved code.</p>
              </div>
            </div>
            <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-primary-700">Total sign-ups</p>
                <p className="text-4xl font-black text-primary-700 mt-1">{referralSummary.total_signups}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest font-black text-primary-700">Fixed code</p>
                <p className="mt-1 inline-flex items-center gap-2 font-mono font-black text-gray-900 bg-white rounded-xl px-3 py-2 border border-primary-100">{referralSummary.code || FIXED_REFERRAL_CODE}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><KeyRound className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Share the referral code</h2>
                <p className="text-xs text-gray-500 font-medium">There is one active code for this campaign.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <code className="flex-1 font-mono text-2xl font-black tracking-widest text-gray-900">{FIXED_REFERRAL_CODE}</code>
              <button onClick={() => void copyReferralCode()} className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-primary-700 hover:border-primary-200 transition-colors" title="Copy referral code">
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-400 font-medium">Only accounts authenticated through Supabase are included in the total.</p>
          </section>

          <section className="lg:col-span-2 bg-white rounded-[28px] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><GraduationCap className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Question bank &amp; study platform</h2>
                <p className="text-xs text-gray-500 font-medium">The PWA uses the same year-and-subject question bank as the learner experience.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatusRow label="Offline study packs" value="Available" />
              <StatusRow label="Authentication" value={isSupabaseConfigured ? 'Connected' : 'Not configured'} />
              <StatusRow label="Analytics" value="PostHog enabled" />
            </div>
          </section>
        </div>
      )}

      {section === 'USERS' && (
        <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">User profiles</h2>
              <p className="text-sm text-gray-500 font-medium">Search accounts and review their Supabase roles.</p>
            </div>
            <div className="flex gap-2">
              {(['ALL', 'ADMIN', 'STUDENT'] as const).map((role) => (
                <button key={role} onClick={() => setRoleFilter(role)} className={`px-3 py-2 rounded-xl text-[10px] font-black ${roleFilter === role ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search by name or user ID" className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-gray-100">
                <th className="px-3 py-3 text-[10px] uppercase tracking-widest font-black text-gray-400">Student</th>
                <th className="px-3 py-3 text-[10px] uppercase tracking-widest font-black text-gray-400">User ID</th>
                <th className="px-3 py-3 text-[10px] uppercase tracking-widest font-black text-gray-400">Role</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-3 py-4 font-bold text-gray-900">{user.display_name || 'Unnamed user'}</td>
                    <td className="px-3 py-4 text-xs font-mono text-gray-500">{formatId(user.id)}</td>
                    <td className="px-3 py-4"><span className={`inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-black ${roleClasses(user.role)}`}>{roleLabel(user.role)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <p className="py-10 text-center text-sm text-gray-400 font-medium">No profiles match this filter.</p>}
          </div>
        </section>
      )}

      {section === 'REFERRAL' && (
        <section className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary-50 text-primary-600"><Share2 className="w-5 h-5" /></div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Referral campaign</h2>
                <p className="text-sm text-gray-500 font-medium">The campaign is intentionally simplified to one code.</p>
              </div>
            </div>
            <button onClick={() => void fetchAdminData()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-black hover:bg-primary-50 hover:text-primary-700"><RefreshCw className="w-4 h-4" /> Refresh</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl bg-primary-50 border border-primary-100 p-6">
              <p className="text-[10px] uppercase tracking-widest font-black text-primary-700">Total student sign-ups</p>
              <p className="text-5xl font-black text-primary-700 mt-2">{referralSummary.total_signups}</p>
              <p className="mt-3 text-xs font-medium text-primary-700">This number is counted once per authenticated user.</p>
            </div>
            <div className="rounded-3xl bg-gray-50 border border-gray-100 p-6">
              <p className="text-[10px] uppercase tracking-widest font-black text-gray-500">Active referral code</p>
              <p className="font-mono text-4xl font-black tracking-widest text-gray-900 mt-2">{FIXED_REFERRAL_CODE}</p>
              <button onClick={() => void copyReferralCode()} className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-black text-gray-700 hover:border-primary-200 hover:text-primary-700">{copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />} {copied ? 'COPIED' : 'COPY CODE'}</button>
            </div>
          </div>
          <div className="mt-5 p-4 rounded-2xl border border-blue-100 bg-blue-50 text-blue-800 text-xs font-bold">Legacy collaborator keys are no longer accepted by the PWA. New referral attribution is recorded through the fixed code only.</div>
        </section>
      )}
    </div>
  );
};

const AdminStatCard: React.FC<{ title: string; value: number; color: string; icon: React.ReactNode }> = ({ title, value, color, icon }) => (
  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
    <div className={`flex items-center gap-2 ${color}`}>
      {icon}
      <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">{title}</span>
    </div>
    <p className={`mt-2 text-2xl font-black ${color}`}>{value}</p>
  </div>
);

const StatusRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
    <span className="text-xs font-bold text-gray-600">{label}</span>
    <span className="text-[10px] uppercase tracking-widest font-black text-emerald-700">{value}</span>
  </div>
);
