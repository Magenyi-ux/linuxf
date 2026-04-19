
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, Book, Ban, ShieldCheck, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<(UserProfile & { password?: string })[]>([]);
  const [globalUsage, setGlobalUsage] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('waExamPrep_users') || '[]');
    setUsers(savedUsers);

    const savedUsage = JSON.parse(localStorage.getItem('waExamPrep_global_usage') || '{}');
    setGlobalUsage(savedUsage);
  }, []);

  const totalUsers = users.length;
  const totalTimeSpent = users.reduce((acc, u) => acc + (u.timeSpent || 0), 0);
  const mostUsedBooks = Object.entries(globalUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const toggleBan = (email: string) => {
    const updatedUsers = users.map(u => {
      if (u.email === email) {
        return { ...u, isBanned: !u.isBanned };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('waExamPrep_users', JSON.stringify(updatedUsers));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-12">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex-1 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
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

        <div className="flex-1 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
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
      </div>

      <h3 className="text-xl font-black text-gray-900 mb-6">User Management</h3>
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Time Spent</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.email} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-gray-900">{user.name || 'Anonymous'}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-gray-600">
                    {formatTime(user.timeSpent || 0)}
                  </td>
                  <td className="px-8 py-5">
                    {user.isBanned ? (
                      <span className="flex items-center gap-1.5 text-red-600 text-xs font-black uppercase">
                        <Ban className="w-3.5 h-3.5" /> Banned
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-green-600 text-xs font-black uppercase">
                        <ShieldCheck className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    {user.email !== 'admin@magenyi' && (
                      <button
                        onClick={() => toggleBan(user.email!)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                          user.isBanned
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {user.isBanned ? 'UNBAN USER' : 'BAN USER'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
