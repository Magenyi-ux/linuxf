
import React, { useEffect, useState } from 'react';
import { UserProfile, Book, StudyPlanTask } from '../types';
import { User, Calendar, BookOpen, CheckCircle2, Trophy, ArrowLeft, LogOut, Edit2, Trash2, X, Save } from 'lucide-react';

interface ProfilePageProps {
    user: UserProfile;
    onBack: () => void;
    onLogout: () => void;
    onUpdateUser: (user: UserProfile) => void;
    onResetData: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack, onLogout, onUpdateUser, onResetData }) => {
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
        <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="flex items-center text-gray-500 hover:text-brand-600 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </button>
                <button
                    onClick={() => { if(confirm('Are you sure you want to sign out? Your local data will remain but you will be redirected to the entry screen.')) onLogout(); }}
                    className="flex items-center text-red-500 hover:text-red-600 font-bold text-sm"
                >
                    <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mb-8">
                <div className="bg-brand-600 h-32 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-lg">
                            <div className="w-full h-full rounded-[20px] bg-brand-50 flex items-center justify-center border-4 border-white">
                                <User className="w-12 h-12 text-brand-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
                            <p className="text-gray-500 flex items-center gap-1.5 mt-1 text-sm">
                                <Calendar className="w-4 h-4" /> Joined {new Date(user.joinedDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <div>
                                <div className="text-[10px] font-bold text-yellow-600 uppercase leading-none">Level</div>
                                <div className="text-lg font-black text-yellow-700 leading-none">{user.level}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatCard icon={<BookOpen />} label="Exam Packs" value={stats.packsDownloaded} color="blue" />
                        <StatCard icon={<CheckCircle2 />} label="Tasks Done" value={stats.tasksCompleted} color="green" />
                        <StatCard icon={<Trophy />} label="Avg. Score" value={`${stats.averageScore}%`} color="brand" />
                        <StatCard icon={<ArrowLeft className="rotate-180" />} label="Attempts" value={stats.totalAttempts} color="purple" />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 ml-1">Account Settings</h3>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600">
                                <Edit2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">Edit Profile</div>
                                <div className="text-xs text-gray-500">Change your display name</div>
                            </div>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180" />
                    </button>

                    <button
                        onClick={() => { if(confirm('Are you sure? This will delete all downloaded packs, study tasks, and chat history.')) onResetData(); }}
                        className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-100 group-hover:text-red-600">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">Clear All Data</div>
                                <div className="text-xs text-gray-500">Reset the app to factory settings</div>
                            </div>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180" />
                    </button>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) setIsEditing(false); }}>
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="Enter your name"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveName}
                                    className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" /> Save Changes
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string }> = ({ icon, label, value, color }) => {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        brand: 'bg-brand-50 text-brand-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    return (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${colorMap[color]}`}>
                {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
            </div>
            <div className="text-xl font-black text-gray-900">{value}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{label}</div>
        </div>
    );
};
