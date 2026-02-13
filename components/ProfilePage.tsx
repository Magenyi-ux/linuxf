
import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import {
  User, Award, Zap, Target, BookOpen, TrendingUp,
  ArrowLeft, Edit3, Save, Trash2, ShieldCheck, Clock
} from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
  books: Record<string, Book>;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, books }) => {
  const [name, setName] = useState('Scholar');
  const [isEditingName, setIsEditingName] = useState(false);
  const [stats, setStats] = useState({
    totalExams: 0,
    avgScore: 0,
    totalQuestions: 0,
    perfectScores: 0
  });

  useEffect(() => {
    // Load name from localStorage
    const savedName = localStorage.getItem('waExamPrep_user_name');
    if (savedName) setName(savedName);

    // Calculate stats from books
    const bookList = Object.values(books);
    if (bookList.length > 0) {
      const totalExams = bookList.reduce((acc, b) => acc + (b.attempts || 0), 0);
      const totalQuestions = bookList.reduce((acc, b) => acc + (b.questions.length * (b.attempts || 0)), 0);
      const perfectScores = bookList.filter(b => b.bestScore === b.questions.length && (b.attempts || 0) > 0).length;

      const totalScorePercent = bookList.reduce((acc, b) => {
        if (!b.attempts) return acc;
        return acc + ((b.bestScore || 0) / b.questions.length);
      }, 0);

      setStats({
        totalExams,
        avgScore: bookList.length > 0 ? Math.round((totalScorePercent / bookList.length) * 100) : 0,
        totalQuestions,
        perfectScores
      });
    }
  }, [books]);

  const handleSaveName = () => {
    localStorage.setItem('waExamPrep_user_name', name);
    setIsEditingName(false);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-400"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
              <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center border-4 border-white overflow-hidden">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            {isEditingName ? (
              <div className="flex gap-2 items-center flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-bold text-gray-900 border-b-2 border-brand-500 focus:outline-none bg-transparent"
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-brand-600 p-2 hover:bg-brand-50 rounded-lg">
                  <Save className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
                <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-brand-600 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full text-brand-700 text-sm font-bold border border-brand-100">
               <ShieldCheck className="w-4 h-4" />
               Level 1 Scholar
            </div>
          </div>
          <p className="text-gray-500 text-sm">JAMB & WAEC Candidate • Joined Today</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-3">
            <Award className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.avgScore}%</div>
          <div className="text-xs text-gray-500 font-medium">Avg. Accuracy</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-3">
            <Zap className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalExams}</div>
          <div className="text-xs text-gray-500 font-medium">Exams Taken</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-3">
            <Target className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</div>
          <div className="text-xs text-gray-500 font-medium">Questions Solved</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.perfectScores}</div>
          <div className="text-xs text-gray-500 font-medium">Perfect Scores</div>
        </div>
      </div>

      {/* Detailed Activity / Recent Library */}
      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-brand-600" />
        Subject Mastery
      </h4>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {Object.keys(books).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No activity recorded yet. Start practicing!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(books).slice(0, 5).map(book => (
              <div key={book.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-bold text-gray-700">{book.subject} ({book.examType})</div>
                  <div className="text-xs font-bold text-brand-600">{Math.round(((book.bestScore || 0) / book.questions.length) * 100)}%</div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${((book.bestScore || 0) / book.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 p-6 border-2 border-dashed border-gray-200 rounded-3xl text-center">
          <p className="text-sm text-gray-500 mb-4 italic">Your data is stored locally on this device. Clearing your browser cache may reset your progress.</p>
          <button
            onClick={() => { if(confirm('Are you sure you want to reset all data? This cannot be undone.')) { localStorage.clear(); window.location.reload(); } }}
            className="text-red-500 text-sm font-bold hover:underline flex items-center gap-2 mx-auto"
          >
            <Trash2 className="w-4 h-4" /> Reset All Progress
          </button>
      </div>
    </div>
  );
};
