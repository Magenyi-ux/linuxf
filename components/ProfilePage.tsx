
import React, { useEffect, useState } from 'react';
import { UserProfile, Book, StudyPlanTask } from '../types';
import { User, Calendar, BookOpen, CheckCircle2, Trophy, ArrowLeft, LogOut, Edit2, Bell } from 'lucide-react';

interface ProfilePageProps {
    user: UserProfile;
    onBack: () => void;
    onLogout: () => void;
    onUpdateUser: (user: UserProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack, onLogout, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.name);
    const [stats, setStats] = useState({
        packsDownloaded: 0,
        tasksCompleted: 0,
        averageScore: 0,
        totalAttempts: 0
    });

    useEffect(() => {
        // Calculate stats from localStorage
        const savedBooks = localStorage.getItem('waExamPrep_books');
        const savedTasks = localStorage.getItem('waExamPrep_tasks');

        let packsCount = 0;
        let completedTasks = 0;
        let totalScore = 0;
        let totalQuestions = 0;
        let totalAttempts = 0;

        if (savedBooks) {
            const books = Object.values(JSON.parse(savedBooks)) as Book[];
            packsCount = books.length;
            books.forEach(b => {
                if (b.bestScore !== undefined) {
                    totalScore += b.bestScore;
                    totalQuestions += b.questions.length;
                    totalAttempts += b.attempts || 0;
                }
            });
        }

        if (savedTasks) {
            const tasks = JSON.parse(savedTasks) as StudyPlanTask[];
            completedTasks = tasks.filter(t => t.completed).length;
        }

        setStats({
            packsDownloaded: packsCount,
            tasksCompleted: completedTasks,
            averageScore: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
            totalAttempts: totalAttempts
        });
    }, []);

    const handleSaveName = () => {
        if (!newName.trim()) return;
        const updatedUser = { ...user, name: newName.trim() };
        onUpdateUser(updatedUser);
        localStorage.setItem('waExamPrep_user', JSON.stringify(updatedUser));
        setIsEditing(false);
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>
                <button
                    onClick={() => { if(confirm('Are you sure you want to sign out? Your local data will remain but you will be redirected to the entry screen.')) onLogout(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-brand-900/5 overflow-hidden">
                <div className="bg-brand-600 h-40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-32 -translate-y-32" />
                    <div className="absolute -bottom-12 left-12">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl rotate-3">
                            <div className="w-full h-full rounded-[2rem] bg-brand-50 flex items-center justify-center border-4 border-white">
                                <User className="w-16 h-16 text-brand-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-24 pb-12 px-12">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                        <div>
                            {isEditing ? (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="text-3xl font-black text-gray-900 border-b-4 border-brand-500 outline-none bg-transparent"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        className="bg-brand-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand-200"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setNewName(user.name); }}
                                        className="text-gray-400 text-sm font-bold uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <h2 className="text-4xl font-black text-gray-900 tracking-tight">{user.name}</h2>
                            )}
                            <p className="text-gray-400 font-bold flex items-center gap-1.5 mt-2 text-sm uppercase tracking-widest">
                                <Calendar className="w-4 h-4" /> Joined {new Date(user.joinedDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="bg-amber-50 px-6 py-4 rounded-3xl border border-amber-100 flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Current Level</div>
                                <div className="text-2xl font-black text-amber-700 leading-none">{user.level}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<BookOpen />} label="Exam Packs" value={stats.packsDownloaded} color="blue" />
                        <StatCard icon={<CheckCircle2 />} label="Tasks Done" value={stats.tasksCompleted} color="green" />
                        <StatCard icon={<Trophy />} label="Avg. Score" value={`${stats.averageScore}%`} color="brand" />
                        <StatCard icon={<ArrowLeft className="rotate-180" />} label="Attempts" value={stats.totalAttempts} color="purple" />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 ml-2">Account Settings</h3>
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full flex items-center justify-between p-8 hover:bg-gray-50 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                <Edit2 className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">Edit Profile</div>
                                <div className="text-sm font-medium text-gray-500">Change your display name and personal info</div>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                        </div>
                    </button>

                    <button
                        className="w-full flex items-center justify-between p-8 hover:bg-gray-50 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-inner">
                                <Bell className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">Notifications</div>
                                <div className="text-sm font-medium text-gray-500">Manage your study reminders and alerts</div>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string }> = ({ icon, label, value, color }) => {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600 shadow-blue-50',
        green: 'bg-emerald-100 text-emerald-600 shadow-emerald-50',
        brand: 'bg-brand-100 text-brand-600 shadow-brand-50',
        purple: 'bg-purple-100 text-purple-600 shadow-purple-50'
    };

    return (
        <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:border-brand-500 hover:shadow-xl transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform ${colorMap[color]}`}>
                {React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7' })}
            </div>
            <div className="text-3xl font-black text-gray-900">{value}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{label}</div>
        </div>
    );
};
