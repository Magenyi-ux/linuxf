
import React from 'react';
import { UserProfile, Book } from '../types';
import { Trophy, Flame, Target, BookOpen, Clock, Trash2, ArrowLeft, LogOut, Trash, LogIn, Mail, User, ArrowRight, Settings, MessageSquare } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  books: Record<string, Book>;
  isLoggedIn: boolean;
  onDeleteBook: (id: string) => void;
  onBack: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onLogin: () => void;
  onUpdateSettings: (settings: Partial<UserProfile>) => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  books,
  isLoggedIn,
  onDeleteBook,
  onBack,
  onLogout,
  onDeleteAccount,
  onLogin,
  onUpdateSettings
}) => {
  const bookList = Object.values(books).sort((a, b) => b.dateCreated - a.dateCreated);
  const totalQuestions = bookList.reduce((acc, b) => acc + b.questions.length, 0);
  const totalAttempts = bookList.reduce((acc, b) => acc + (b.attempts || 0), 0);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-12">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* User Card */}
        <div className="flex-1 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          {!isLoggedIn && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
               <div className="bg-primary-50 p-4 rounded-3xl mb-4">
                  <LogIn className="w-8 h-8 text-primary-600" />
               </div>
               <h3 className="text-xl font-black text-gray-900 mb-2">Sign in to track progress</h3>
               <p className="text-sm text-gray-500 font-medium mb-6">Create an account to save your XP, levels, and streak across devices.</p>
               <button
                onClick={onLogin}
                className="px-8 py-3 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2"
               >
                 <LogIn className="w-4 h-4" /> SIGN IN
               </button>
            </div>
          )}

          <div className="w-24 h-24 bg-primary-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black mb-6 shadow-xl shadow-primary-500/20">
            {user.level}
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Scholar Level {user.level}</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">{user.xp} Total XP</p>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-8">
            <div className="bg-primary-600 h-full transition-all duration-1000" style={{ width: `${(user.xp % 1000) / 10}%` }}></div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-2">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-xl font-black text-gray-900">{user.streak}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Streak</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-2">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xl font-black text-gray-900">{totalAttempts}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Sessions</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-2">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-xl font-black text-gray-900">
                {bookList.filter(b => b.bestScore && b.bestScore === b.questions.length).length}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Perfect</span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex-1 space-y-4">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <BookOpen className="w-7 h-7" />
                </div>
                <div>
                    <div className="text-2xl font-black text-gray-900">{bookList.length}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Downloaded Packs</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <Clock className="w-7 h-7" />
                </div>
                <div>
                    <div className="text-2xl font-black text-gray-900">{totalQuestions}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Questions Offline</div>
                </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Settings className="w-4 h-4" /> App Settings
                </h3>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2.5 rounded-xl text-primary-600">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">Chat Assistant</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Floating tutor button</div>
                        </div>
                    </div>
                    <button
                        onClick={() => onUpdateSettings({ showChatBot: !user.showChatBot })}
                        className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${user.showChatBot !== false ? 'bg-primary-600' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${user.showChatBot !== false ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                {user.chatBotPosition && (
                    <button
                        onClick={() => onUpdateSettings({ chatBotPosition: null })}
                        className="w-full text-xs font-bold text-primary-600 hover:underline mb-4"
                    >
                        Reset Chat Button Position
                    </button>
                )}
            </div>

            {isLoggedIn ? (
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <User className="w-4 h-4" /> Account Settings
                </h3>

                <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="bg-white p-2.5 rounded-xl text-gray-400">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</div>
                        <div className="text-sm font-bold text-gray-900 truncate">{user.email}</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5" />
                            <span>Log Out</span>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>

                    <button
                        onClick={onDeleteAccount}
                        className="w-full flex items-center justify-between px-6 py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <Trash className="w-5 h-5" />
                            <span>Delete Account</span>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                </div>
              </div>
            ) : (
              <div className="bg-primary-600 p-8 rounded-[40px] text-white shadow-xl shadow-primary-500/20">
                  <h3 className="text-lg font-black mb-2">Study Goal</h3>
                  <p className="text-primary-100 text-sm font-medium leading-relaxed opacity-80">
                      You're doing great! Keep practicing to increase your streak and level up.
                  </p>
              </div>
            )}
        </div>
      </div>

      <h3 className="text-xl font-black text-gray-900 mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {bookList.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-[40px]">
            <p className="text-gray-400 font-medium">No activity yet. Start studying!</p>
          </div>
        ) : (
          bookList.map((book) => (
            <div key={book.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[32px] hover:border-primary-300 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 font-black text-lg group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                  {book.year.slice(2)}
                </div>
                <div>
                  <div className="font-black text-gray-900 leading-tight">{book.subject}</div>
                  <div className="text-[10px] text-gray-400 font-black flex items-center gap-3 mt-1">
                    <span className="text-primary-600 uppercase">{book.examType}</span>
                    {book.attempts !== undefined && book.attempts > 0 && (
                      <span className="flex items-center gap-1">
                        Best: {book.bestScore}/{book.questions.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { if(confirm('Delete this pack?')) onDeleteBook(book.id); }}
                className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
