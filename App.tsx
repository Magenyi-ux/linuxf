
/**
 * App.tsx - Main Application Component
 * This file manages the overall state, navigation, and core logic of the West African Exam Prep AI app.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ScreenState, ExamType, Subject, Question, Book, UserProfile } from './types';
import { ExamCard } from './components/ExamCard';
import { LoadingScreen } from './components/LoadingScreen';
import { Results } from './components/Results';
import { PracticeSession } from './components/PracticeSession';
import { StudyPlanner } from './components/StudyPlanner';
import { ChatBot } from './components/ChatBot';
import { Auth } from './components/Auth';
import { ProfilePage } from './components/ProfilePage';
import { CountdownMenu } from './components/CountdownMenu';
import { GamificationBar } from './components/GamificationBar';
import { PDFUpload } from './components/PDFUpload';
import { PDFViewer } from './components/PDFViewer';
import { TheoryPractice } from './components/TheoryPractice';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
// Removed ConvexSync as Convex integration is being disabled for now
// import { ConvexSync } from './components/ConvexSync';
import { fetchExamQuestions } from './services/geminiService';
import { 
  GraduationCap, ArrowRight, Library, DownloadCloud, BookOpen, 
  Trash2, Calculator, BookA, Atom, FlaskConical, Dna, 
  TrendingUp, Landmark, Feather, WifiOff, Play,
  Leaf, Briefcase, Globe, Scale, ScrollText, BookHeart, Moon, Map, X, Trophy, Calendar,
  Cloud, CloudOff, User, LogIn, LogOut, Clock, Search, Upload, MessageSquare, ChevronRight, Bell
} from 'lucide-react';
import { useUserId } from "./hooks/useUserId";
// Removed Clerk imports
// import { SignInButton, UserButton } from "@clerk/clerk-react";

/**
 * Stream Definitions - Categorizes subjects into Science, Arts, and Commercial departments.
 */
type StreamType = 'SCIENCE' | 'ARTS' | 'COMMERCIAL';

const STREAMS: { id: StreamType; label: string; icon: React.ElementType; color: string; description: string }[] = [
  { 
    id: 'SCIENCE', 
    label: 'Science', 
    icon: Atom, 
    color: 'bg-blue-500',
    description: 'Engineering, Medicine, Technology'
  },
  { 
    id: 'COMMERCIAL', 
    label: 'Commercial', 
    icon: TrendingUp, 
    color: 'bg-orange-500',
    description: 'Business, Accounting, Economics' 
  },
  { 
    id: 'ARTS', 
    label: 'Arts & Humanities', 
    icon: Feather, 
    color: 'bg-pink-500',
    description: 'Law, History, Languages' 
  }
];

/**
 * Mapping of subjects to their respective streams.
 */
const SUBJECTS_BY_STREAM: Record<StreamType, Subject[]> = {
  SCIENCE: [
    Subject.ENGLISH, Subject.MATHEMATICS, 
    Subject.PHYSICS, Subject.CHEMISTRY, Subject.BIOLOGY, 
    Subject.FURTHER_MATHS, Subject.AGRIC_SCIENCE, Subject.GEOGRAPHY,
    Subject.ECONOMICS
  ],
  ARTS: [
    Subject.ENGLISH, Subject.MATHEMATICS,
    Subject.LITERATURE, Subject.GOVERNMENT, Subject.HISTORY, 
    Subject.CIVIC_EDUCATION, Subject.CRS, Subject.IRS, 
    Subject.FRENCH, Subject.ARABIC, Subject.GEOGRAPHY
  ],
  COMMERCIAL: [
    Subject.ENGLISH, Subject.MATHEMATICS,
    Subject.ECONOMICS, Subject.COMMERCE, Subject.GOVERNMENT,
    Subject.CRS, Subject.IRS
  ]
};

/**
 * Helper to check if Clerk is configured.
 * Updated to return false as we are disabling Clerk.
 */
const isClerkAvailable = () => {
    return false;
};

/**
 * Fallback Component for Sign In Button when Clerk is disabled.
 */
const SafeSignInButton: React.FC<any> = ({ children, ...props }) => {
  return <>{children}</>;
};

/**
 * Fallback Component for User Button when Clerk is disabled.
 */
const SafeUserButton: React.FC<any> = (props) => {
  return <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-gray-500" /></div>;
};

/**
 * Main App Component Logic
 */
const App: React.FC = () => {
  // --- State Hooks ---
  const [screen, setScreen] = useState<ScreenState>('HOME');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showCountdowns, setShowCountdowns] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSources, setCurrentSources] = useState<string[]>([]);
  const [practiceMode, setPracticeMode] = useState<'STUDY' | 'TEST'>('STUDY');
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  
  const [lastScore, setLastScore] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);

  const [books, setBooks] = useState<Record<string, Book>>({}); 
  const { userId, type: userType } = useUserId();

  // --- Effects ---

  // Handle Online/Offline Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved question packs (books) and user from local storage on startup
  useEffect(() => {
    try {
      const savedBooks = localStorage.getItem('waExamPrep_books');
      if (savedBooks) setBooks(JSON.parse(savedBooks));

      const savedUser = localStorage.getItem('waExamPrep_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setScreen('AUTH');
      }
    } catch (e) {
      console.error("Failed to load data from storage", e);
    }
  }, []);

  /**
   * Saves a question pack to state and local storage.
   */
  const saveBook = useCallback(async (book: Book) => {
    try {
      const newBooks = { ...books, [book.id]: book };
      setBooks(newBooks);
      localStorage.setItem('waExamPrep_books', JSON.stringify(newBooks));
    } catch (e) {
      console.error("Failed to save book", e);
    }
  }, [books]);

  /**
   * Deletes a question pack from state and local storage.
   */
  const deleteBook = (bookId: string) => {
    const { [bookId]: removed, ...rest } = books;
    setBooks(rest);
    localStorage.setItem('waExamPrep_books', JSON.stringify(rest));
  };

  /**
   * Generates a unique ID for a question pack.
   */
  const getBookId = (exam: ExamType, subject: Subject, year: string) => `${exam}-${subject}-${year}`;

  /**
   * Returns the appropriate icon for a given subject.
   */
  const getSubjectIcon = (subject: Subject) => {
    switch (subject) {
      case Subject.MATHEMATICS: return <Calculator className="w-5 h-5" />;
      case Subject.ENGLISH: return <BookA className="w-5 h-5" />;
      case Subject.PHYSICS: return <Atom className="w-5 h-5" />;
      case Subject.CHEMISTRY: return <FlaskConical className="w-5 h-5" />;
      case Subject.BIOLOGY: return <Dna className="w-5 h-5" />;
      case Subject.FURTHER_MATHS: return <Calculator className="w-5 h-5 text-indigo-500" />;
      case Subject.AGRIC_SCIENCE: return <Leaf className="w-5 h-5" />;
      case Subject.GEOGRAPHY: return <Map className="w-5 h-5" />;
      case Subject.ECONOMICS: return <TrendingUp className="w-5 h-5" />;
      case Subject.COMMERCE: return <Briefcase className="w-5 h-5" />;
      case Subject.GOVERNMENT: return <Landmark className="w-5 h-5" />;
      case Subject.LITERATURE: return <Feather className="w-5 h-5" />;
      case Subject.HISTORY: return <ScrollText className="w-5 h-5" />;
      case Subject.CIVIC_EDUCATION: return <Scale className="w-5 h-5" />;
      case Subject.CRS: return <BookHeart className="w-5 h-5" />;
      case Subject.IRS: return <Moon className="w-5 h-5" />;
      case Subject.FRENCH: 
      case Subject.ARABIC: return <Globe className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  // Generate a list of available years for past questions
  const years = Array.from({ length: 15 }, (_, i) => (2024 - i).toString());

  /**
   * Starts a practice session with a selected book.
   */
  const handleStart = (bookId: string) => {
     if (books[bookId]) {
         setQuestions(books[bookId].questions);
         setCurrentSources(books[bookId].sources || []);
         setActiveBookId(bookId);
         setScreen('PRACTICE');
     }
  };

  /**
   * Downloads a question pack using the Gemini AI service.
   */
  const handleDownload = async (year: string) => {
     if (!selectedExam || !selectedSubject) return;
     
     const bookId = getBookId(selectedExam, selectedSubject, year);
     
     setScreen('LOADING');
     try {
        const result = await fetchExamQuestions(selectedExam, selectedSubject, year, 15);
        
        const newBook: Book = {
            id: bookId,
            examType: selectedExam,
            subject: selectedSubject,
            year: year,
            questions: result.questions,
            sources: result.sources,
            dateCreated: Date.now(),
            bestScore: 0,
            attempts: 0
        };
        
        await saveBook(newBook);
        setScreen('YEAR_SELECT');
     } catch (err) {
        alert("Could not download questions. Check your internet connection or try again.");
        setScreen('YEAR_SELECT');
     }
  };

  /**
   * Handles the completion of a practice session.
   */
  const handleFinishPractice = async (score: number, total: number) => {
      setLastScore(score);
      setLastTotal(total);

      if (activeBookId && books[activeBookId]) {
          const book = books[activeBookId];
          const updatedBook: Book = {
              ...book,
              attempts: (book.attempts || 0) + 1,
              lastScore: score,
              bestScore: Math.max(book.bestScore || 0, score)
          };
          await saveBook(updatedBook);
      }

      // Update User XP and Level
      if (user) {
          // Award XP: 10 XP for finishing, plus 10 XP per correct answer
          const xpGained = 10 + (score * 10);
          let newXp = user.xp + xpGained;
          let newLevel = user.level;

          // Level up logic: Level X requires X * 500 XP
          while (newXp >= newLevel * 500) {
              newXp -= (newLevel * 500);
              newLevel++;
          }

          // Streak logic: Simple increment if last practice was not today
          // For the MVP, we'll just increment it
          const updatedUser = {
              ...user,
              xp: newXp,
              level: newLevel,
              streak: user.streak + 1
          };

          setUser(updatedUser);
          localStorage.setItem('waExamPrep_user', JSON.stringify(updatedUser));
      }
      
      setScreen('RESULTS');
  };

  /**
   * Resets the application state to the home screen.
   */
  const resetApp = () => {
    if (!user) {
        setScreen('AUTH');
    } else {
        setScreen('HOME');
    }
    setSelectedExam(null);
    setSelectedStream(null);
    setSelectedSubject(null);
    setActiveBookId(null);
  };

  const handleLogout = () => {
      localStorage.removeItem('waExamPrep_user');
      setUser(null);
      setScreen('AUTH');
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] text-gray-900 font-sans flex relative">
      {user && screen !== 'AUTH' && (
        <Sidebar
          currentScreen={screen}
          setScreen={setScreen}
          packCount={Object.keys(books).length}
          onShowCountdowns={() => setShowCountdowns(true)}
          onShowLibrary={() => setShowLibrary(true)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto sidebar-scrollbar">
        {/* Navigation Header */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-4 lg:hidden cursor-pointer" onClick={resetApp}>
              <div className="bg-brand-600 p-1.5 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">Exambly</span>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                {screen === 'HOME' ? 'Overview' : screen.replace('_', ' ')}
              </h2>
            </div>

            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for subjects, topics, or years..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-2xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Connection Status Indicator */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                    {isOnline ? (
                        <>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Connected</span>
                        </>
                    ) : (
                        <>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Offline</span>
                        </>
                    )}
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                {/* User Profile */}
                {user && (
                    <button
                      onClick={() => setScreen('PROFILE')}
                      className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-50 rounded-full transition-all border border-transparent hover:border-gray-100"
                    >
                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-brand-100">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-gray-700 hidden sm:block">{user.name.split(' ')[0]}</span>
                    </button>
                )}
            </div>
          </div>
        </nav>

        {/* Gamification Bar - More Integrated */}
        {user && screen !== 'AUTH' && (
          <div className="max-w-5xl mx-auto w-full px-4 md:px-8 mt-4 lg:hidden">
             <GamificationBar profile={user} />
          </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-8 relative pb-24 lg:pb-8`}>
        
        {/* Home Screen: Exam Selection */}
        {screen === 'HOME' && (
          <div className="animate-fade-in-up space-y-8">
            {user && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -translate-y-32 translate-x-32 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                    Welcome back, {user.name.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-gray-500 font-medium">
                    You've mastered <span className="text-brand-600">12 topics</span> this week. Keep up the great work!
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-200 cursor-pointer hover:bg-brand-700 transition-colors">
                      Resume Practice
                    </div>
                    <div className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                      View Analytics
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block relative z-10 w-48">
                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-50 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Daily Goal</span>
                            <span className="text-[10px] font-bold text-brand-600">80%</span>
                         </div>
                         <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="w-[80%] h-full bg-brand-500 rounded-full" />
                         </div>
                         <p className="text-[10px] mt-2 text-gray-500 font-medium">45/60 Questions</p>
                    </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Prepare for Exams</h2>
                    <button className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ExamCard
                    type={ExamType.JAMB}
                    description="Joint Admissions & Matriculation Board"
                    onClick={(t) => { setSelectedExam(t); setScreen('STREAM_SELECT'); }}
                    colorClass="bg-emerald-500"
                  />
                  <ExamCard
                    type={ExamType.WAEC}
                    description="West African Senior School Certificate"
                    onClick={(t) => { setSelectedExam(t); setScreen('STREAM_SELECT'); }}
                    colorClass="bg-amber-500"
                  />
                  <ExamCard
                    type={ExamType.NECO}
                    description="National Examinations Council"
                    onClick={(t) => { setSelectedExam(t); setScreen('STREAM_SELECT'); }}
                    colorClass="bg-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-6">
                 <h2 className="text-xl font-bold text-gray-900">Recommended</h2>
                 <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Mathematics</p>
                            <p className="text-xs text-gray-500">Algebra & Functions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <BookA className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">English Language</p>
                            <p className="text-xs text-gray-500">Lexis & Structure</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                            <Atom className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Physics</p>
                            <p className="text-xs text-gray-500">Optics & Waves</p>
                        </div>
                    </div>
                 </div>

                 <div className="bg-gradient-to-br from-indigo-600 to-brand-700 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
                    <Trophy className="w-10 h-10 mb-4 opacity-50" />
                    <h3 className="text-lg font-bold mb-2">Leaderboard</h3>
                    <p className="text-indigo-100 text-sm mb-4">Ranked #14 among 2,400 students this week.</p>
                    <button className="w-full bg-white/10 backdrop-blur-md py-2.5 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">
                        View Rankings
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Stream Selection: Department selection */}
        {screen === 'STREAM_SELECT' && (
          <div className="animate-fade-in space-y-8">
             <button onClick={() => setScreen('HOME')} className="flex items-center text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors group">
                <ArrowRight className="w-4 h-4 rotate-180 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Select Department</h2>
                <p className="text-gray-500 font-medium">Choose your stream to see the relevant subjects for your exam.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STREAMS.map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => { setSelectedStream(stream.id); setScreen('SUBJECT_SELECT'); }}
                  className="group p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-500 transition-all duration-500 text-left flex flex-col items-start"
                >
                  <div className={`w-14 h-14 rounded-2xl ${stream.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <stream.icon className={`w-7 h-7 ${stream.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">{stream.label}</h3>
                  <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">{stream.description}</p>
                  <div className="mt-auto w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject Selection */}
        {screen === 'SUBJECT_SELECT' && selectedStream && (
          <div className="animate-fade-in space-y-8">
            <button onClick={() => setScreen('STREAM_SELECT')} className="flex items-center text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors group">
                <ArrowRight className="w-4 h-4 rotate-180 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Departments
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                 <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Pick a Subject</h2>
                    <p className="text-gray-500 font-medium">Choose a subject to start practicing past questions.</p>
                 </div>
                 <div className="px-4 py-2 bg-brand-50 rounded-xl text-xs font-extrabold text-brand-600 uppercase tracking-widest border border-brand-100">
                    {STREAMS.find(s => s.id === selectedStream)?.label}
                 </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUBJECTS_BY_STREAM[selectedStream]
                .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((subject) => (
                <button
                  key={subject}
                  onClick={() => { setSelectedSubject(subject); setScreen('YEAR_SELECT'); }}
                  className="flex items-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-brand-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mr-4 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-inner">
                      {getSubjectIcon(subject)}
                  </div>
                  <div className="flex-1">
                      <span className="block font-bold text-gray-800 group-hover:text-brand-600 transition-colors">{subject}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year Selection and Pack Management */}
        {screen === 'YEAR_SELECT' && selectedExam && selectedSubject && (
            <div className="animate-fade-in space-y-8">
                <button onClick={() => setScreen('SUBJECT_SELECT')} className="flex items-center text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors group">
                    <ArrowRight className="w-4 h-4 rotate-180 mr-2 group-hover:-translate-x-1 transition-transform" /> Change Subject
                </button>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-700" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-100">
                            {getSubjectIcon(selectedSubject)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">{selectedSubject}</h2>
                            <p className="text-gray-500 font-medium">{selectedExam} Question Bank</p>
                        </div>
                    </div>

                    <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 relative z-10">
                        <button 
                            onClick={() => setPracticeMode('STUDY')}
                            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${practiceMode === 'STUDY' ? 'bg-white shadow-md text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Study Mode
                        </button>
                        <button 
                            onClick={() => setPracticeMode('TEST')}
                            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${practiceMode === 'TEST' ? 'bg-white shadow-md text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Test Mode
                        </button>
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                             <h3 className="text-xl font-bold text-gray-900">Yearly Packs</h3>
                             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{years.length} Years available</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {years.filter(y => y.includes(searchQuery)).map((year) => {
                                const bookId = getBookId(selectedExam, selectedSubject, year);
                                const isDownloaded = !!books[bookId];
                                const book = books[bookId];

                                return (
                                    <div key={year} className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-brand-500 hover:shadow-xl transition-all duration-300 flex flex-col items-start gap-4">
                                        <div className="flex items-center justify-between w-full">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg ${isDownloaded ? 'bg-brand-50 text-brand-600' : 'bg-gray-50 text-gray-400'}`}>
                                                {year.slice(2)}
                                            </div>
                                            {isDownloaded && (
                                                <button
                                                    onClick={() => { if(confirm('Delete this pack?')) deleteBook(bookId); }}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div>
                                            <div className="font-bold text-gray-900">{year} Exam</div>
                                            <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                                                {isDownloaded ? (
                                                    <span className="text-emerald-500">Offline Ready</span>
                                                ) : (
                                                    <span>Needs Download</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full mt-2">
                                            {isDownloaded ? (
                                                <button
                                                    onClick={() => handleStart(bookId)}
                                                    className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-100 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                                >
                                                    <Play className="w-4 h-4 fill-current" /> Start Practice
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDownload(year)}
                                                    className="w-full py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-brand-50 hover:text-brand-600 border border-gray-100 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <DownloadCloud className="w-4 h-4" /> Download
                                                </button>
                                            )}
                                        </div>

                                        {isDownloaded && book.bestScore !== undefined && book.attempts > 0 && (
                                            <div className="w-full pt-3 border-t border-gray-50 mt-1 flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Best Score</span>
                                                <span className="text-xs font-extrabold text-brand-600">{book.bestScore}/{book.questions.length}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900">Theory</h3>
                        <button
                            onClick={() => setScreen('THEORY')}
                            className="w-full p-8 bg-gradient-to-br from-indigo-600 to-brand-700 rounded-[2rem] text-white flex flex-col items-start gap-6 group hover:shadow-2xl hover:shadow-indigo-200 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-16 -translate-y-16 group-hover:scale-125 transition-transform duration-700" />

                            <div className="bg-white/20 p-4 rounded-2xl relative z-10">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <div className="text-left relative z-10">
                                <div className="font-extrabold text-2xl leading-tight mb-2">Practice Theory</div>
                                <div className="text-indigo-100 text-sm font-medium leading-relaxed">
                                    Write comprehensive essays and get detailed feedback from our AI examiner.
                                </div>
                            </div>
                            <div className="w-full flex items-center justify-between relative z-10 mt-4">
                                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Open Practice</span>
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </button>

                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4">Study Tips</h4>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                    <p className="text-sm text-gray-500 font-medium">Practice with a timer to improve your speed for the actual exam.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    <p className="text-sm text-gray-500 font-medium">Review your mistakes in Study Mode before attempting Test Mode.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Loading Spinner during Download */}
        {screen === 'LOADING' && (
             <LoadingScreen message={`Downloading ${selectedExam} ${selectedSubject} question pack...`} />
        )}

        {/* Theory Practice Screen */}
        {screen === 'THEORY' && selectedExam && selectedSubject && (
            <TheoryPractice
                subject={selectedSubject}
                examType={selectedExam}
                onBack={() => setScreen('YEAR_SELECT')}
            />
        )}

        {/* Practice Session Component */}
        {screen === 'PRACTICE' && selectedExam && selectedSubject && (
            <PracticeSession 
                questions={questions}
                sources={currentSources}
                examType={selectedExam}
                subject={selectedSubject}
                mode={practiceMode}
                onFinish={handleFinishPractice}
                onBack={() => setScreen('YEAR_SELECT')}
            />
        )}

        {/* Results Screen after Practice */}
        {screen === 'RESULTS' && selectedExam && selectedSubject && (
            <Results 
                score={lastScore}
                total={lastTotal}
                examType={selectedExam}
                subject={selectedSubject}
                onRetry={() => setScreen('PRACTICE')}
                onHome={resetApp}
            />
        )}

        {/* Study Planner Component */}
        {screen === 'STUDY_PLAN' && (
            <StudyPlanner onBack={() => setScreen('HOME')} />
        )}

        {/* Auth Screen */}
        {screen === 'AUTH' && (
            <Auth onAuthComplete={(u) => { setUser(u); setScreen('HOME'); }} />
        )}

        {/* Profile Screen */}
        {screen === 'PROFILE' && user && (
            <ProfilePage
                user={user}
                onBack={() => setScreen('HOME')}
                onLogout={handleLogout}
                onUpdateUser={setUser}
            />
        )}

        {/* PDF Viewer Screen */}
        {screen === 'PDF_VIEW' && selectedPdf && (
            <PDFViewer
                file={selectedPdf}
                onBack={() => setScreen('HOME')}
            />
        )}
      </main>

      {/* Library Modal: Overview of all downloaded packs */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) setShowLibrary(false); }}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Library className="w-5 h-5 text-brand-600" />
                        <h3 className="font-bold text-gray-900">My Library</h3>
                        <span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full font-bold">{Object.keys(books).length}</span>
                    </div>
                    <button onClick={() => setShowLibrary(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-4 space-y-3 flex-1 sidebar-scrollbar">
                    {Object.keys(books).length === 0 ? (
                        <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                 <Library className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="text-sm font-medium">Your library is empty.</p>
                            <p className="text-xs mt-1">Download packs to study offline.</p>
                        </div>
                    ) : (
                        (Object.values(books) as Book[])
                            .filter(b => b.subject.toLowerCase().includes(searchQuery.toLowerCase()) || b.year.includes(searchQuery))
                            .sort((a,b) => b.dateCreated - a.dateCreated).map((book) => (
                            <div key={book.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-brand-300 transition-all shadow-sm group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors relative">
                                        {book.year.slice(2)}
                                        {book.bestScore !== undefined && book.bestScore > (book.questions.length * 0.8) && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">{book.subject}</div>
                                        <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                                            {book.examType}
                                            {book.bestScore !== undefined && (
                                                <span className="text-brand-600 flex items-center gap-0.5">
                                                    <Trophy className="w-3 h-3" />
                                                    {book.bestScore}/{book.questions.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { handleStart(book.id); setShowLibrary(false); }} 
                                        className="p-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition-all"
                                        title="Start Practice"
                                    >
                                        <Play className="w-4 h-4 fill-current" />
                                    </button>
                                    <button 
                                        onClick={() => { 
                                            if(window.confirm(`Delete ${book.examType} ${book.subject} ${book.year}?`)) {
                                                deleteBook(book.id);
                                            }
                                        }} 
                                        className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                                        title="Delete Pack"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                 <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                    <button
                        onClick={() => { setShowPdfUpload(true); setShowLibrary(false); }}
                        className="w-full bg-brand-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Upload className="w-4 h-4" /> Upload Study PDF
                    </button>
                    <button onClick={() => setShowLibrary(false)} className="text-sm font-bold text-gray-500 hover:text-gray-700 py-1">
                        Close Library
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* AI Chat Bot Overlay: Accessible from any screen */}
      <ChatBot />

      {/* Bottom Nav for Mobile */}
      {user && screen !== 'AUTH' && (
        <BottomNav
          currentScreen={screen}
          setScreen={setScreen}
          onShowLibrary={() => setShowLibrary(true)}
        />
      )}

      {/* Countdown Menu Modal */}
      <CountdownMenu isOpen={showCountdowns} onClose={() => setShowCountdowns(false)} />

      {/* PDF Upload Modal */}
      {showPdfUpload && (
          <PDFUpload
            onUpload={(file) => {
                setSelectedPdf(file);
                setShowPdfUpload(false);
                setScreen('PDF_VIEW');
            }}
            onClose={() => setShowPdfUpload(false)}
          />
      )}
      </div>
    </div>
  );
};

export default App;
