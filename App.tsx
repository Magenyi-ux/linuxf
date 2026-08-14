
import React, { useState, useEffect } from 'react';
import { ScreenState, ExamType, Subject, Question, Book, UserProfile } from './types';
import { ExamCard } from './components/ExamCard';
import { LoadingScreen } from './components/LoadingScreen';
import { Results } from './components/Results';
import { PracticeSession } from './components/PracticeSession';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatBot } from './components/ChatBot';
import { Auth } from './components/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { enqueueAchievement, enqueueProgress } from './services/offlineQueue';
import { getRemoteAchievementKeys, getRemoteProgressTotals, syncUserData } from './services/syncService';
import { fetchExamQuestions } from './services/aiService';
import { trackEvent } from './services/analytics';
import { captureReferralKeyFromUrl, fetchMyReferralSummary, type ReferralSummary } from './services/referralService';
import { 
  GraduationCap, ArrowRight, Library, DownloadCloud, BookOpen, 
  Trash2, Calculator, BookA, Atom, FlaskConical, Dna, 
  TrendingUp, Landmark, Feather, WifiOff, Play,
  Leaf, Briefcase, Globe, Scale, ScrollText, BookHeart, Moon, Sun, Map, X, Trophy, Home, ArrowLeft, Search, User, LogOut, LogIn
} from 'lucide-react';

// Stream Definitions
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

const HOME_QUOTES = [
  "Prepare for your exams.",
  "Master your subjects with ease.",
  "The smartest way to study offline.",
  "Excellence is a habit, practice often.",
  "Your journey to success starts here.",
  "Crack WAEC, JAMB & NECO with confidence."
];

const AppShell: React.FC = () => {
  const { user: supabaseUser, profile: authProfile, loading: authLoading, signOut } = useAuth();
  const [screen, setScreen] = useState<ScreenState>('HOME');
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedRandSubjects, setSelectedRandSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSources, setCurrentSources] = useState<string[]>([]);
  const [practiceMode, setPracticeMode] = useState<'STUDY' | 'TEST'>('STUDY');
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [lastScore, setLastScore] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [books, setBooks] = useState<Record<string, Book>>({}); 
  const [userProfile, setUserProfile] = useState<UserProfile>({
    level: 1,
    xp: 0,
    streak: 0,
    role: 'USER',
    timeSpent: 0,
    isBanned: false,
    showChatBot: true,
    chatBotPosition: null
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [referralSummary, setReferralSummary] = useState<ReferralSummary | null>(null);
  const [apkMetadata, setApkMetadata] = useState<{ version: string; updatedAt: string } | null>(null);
  const [offlineDarkMode, setOfflineDarkMode] = useState(() => {
    try {
      return localStorage.getItem('spherelearn_offline_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const offlineStudySurface = offlineDarkMode && !['AUTH', 'ADMIN', 'PROFILE'].includes(screen);

  useEffect(() => {
    localStorage.setItem('spherelearn_offline_dark_mode', String(offlineDarkMode));
  }, [offlineDarkMode]);

  useEffect(() => {
    captureReferralKeyFromUrl();
    fetch('/builds/metadata.json')
      .then(res => res.json())
      .then(data => setApkMetadata(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % HOME_QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let currentText = '';
    let charIndex = 0;
    const quote = HOME_QUOTES[currentQuoteIndex];

    setDisplayText('');

    const typingInterval = setInterval(() => {
      if (charIndex < quote.length) {
        currentText += quote[charIndex];
        setDisplayText(currentText);
        charIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentQuoteIndex]);

  useEffect(() => {
    trackEvent('app_session_start');
  }, []);

  useEffect(() => {
    try {
      // Legacy local accounts could contain plaintext passwords. Remove only the old
      // account/session records; downloaded question packs remain available offline.
      localStorage.removeItem('waExamPrep_users');
      localStorage.removeItem('waExamPrep_session');
      const savedProfile = localStorage.getItem('waExamPrep_profile');
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));

      const savedBooks = localStorage.getItem('waExamPrep_books');
      if (savedBooks) setBooks(JSON.parse(savedBooks));
    } catch (error) {
      console.error('Failed to load local study data:', error);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (supabaseUser) {
      setIsLoggedIn(true);
      if (authProfile) {
        setUserProfile((previous) => ({ ...previous, ...authProfile }));
      } else {
        setUserProfile((previous) => ({ ...previous, id: supabaseUser.id, email: supabaseUser.email || undefined }));
      }
      return;
    }

    setIsLoggedIn(false);
    setUserProfile((previous) => ({
      ...previous,
      id: undefined,
      name: undefined,
      email: undefined,
      role: 'USER',
      xp: 0,
      level: 1,
      streak: 0,
    }));
  }, [authLoading, authProfile, supabaseUser]);

  useEffect(() => {
    if (!supabaseUser || !isLoggedIn) {
      setReferralSummary(null);
      return;
    }

    let active = true;
    void fetchMyReferralSummary()
      .then((summary) => {
        if (active) setReferralSummary(summary);
      })
      .catch((error) => console.warn('Referral summary unavailable:', error));

    const reconcile = async () => {
      try {
        await syncUserData(supabaseUser.id);
        const [totals, remoteAchievementKeys] = await Promise.all([
          getRemoteProgressTotals(supabaseUser.id),
          getRemoteAchievementKeys(supabaseUser.id),
        ]);
        if (!active) return;

        const achievementStorageKey = `examply_achievements_${supabaseUser.id}`;
        const localAchievementKeys = JSON.parse(localStorage.getItem(achievementStorageKey) || '[]') as string[];
        const mergedAchievementKeys = Array.from(new Set([...localAchievementKeys, ...remoteAchievementKeys]));
        localStorage.setItem(achievementStorageKey, JSON.stringify(mergedAchievementKeys));

        setUserProfile((previous) => ({
          ...previous,
          xp: Math.max(previous.xp, totals.xp),
          level: Math.floor(Math.max(previous.xp, totals.xp) / 1000) + 1,
        }));
      } catch (error) {
        console.warn('Progress sync deferred until the next connection:', error);
      }
    };

    const onOnline = () => { void reconcile(); };
    window.addEventListener('online', onOnline);
    void reconcile();

    return () => {
      active = false;
      window.removeEventListener('online', onOnline);
    };
  }, [isLoggedIn, supabaseUser]);

  // Effect to reload books when login state or user changes
  useEffect(() => {
    if (isLoggedIn && userProfile.email) {
      const bookKey = `waExamPrep_books_${userProfile.email}`;
      const savedBooks = localStorage.getItem(bookKey);
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
      } else {
        setBooks({});
      }
    } else if (!isLoggedIn) {
       const savedBooks = localStorage.getItem('waExamPrep_books');
       if (savedBooks) setBooks(JSON.parse(savedBooks));
       else setBooks({});
    }
  }, [isLoggedIn, userProfile.email]);

  useEffect(() => {
    localStorage.setItem('waExamPrep_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Time Tracking Effect
  useEffect(() => {
    let interval: any;
    if (isLoggedIn) {
      interval = setInterval(() => {
        setUserProfile(prev => ({
          ...prev,
          timeSpent: (prev.timeSpent || 0) + 10
        }));
      }, 10000); // Update every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoggedIn]);

  const saveBook = (book: Book) => {
    try {
      const newBooks = { ...books, [book.id]: book };
      setBooks(newBooks);
      const bookKey = isLoggedIn && userProfile.email ? `waExamPrep_books_${userProfile.email}` : 'waExamPrep_books';
      localStorage.setItem(bookKey, JSON.stringify(newBooks));
    } catch (e) {
      alert("Storage Full! Your device storage is full. Please delete some old question packs from the Library to save new ones.");
    }
  };

  const deleteBook = (bookId: string) => {
    const { [bookId]: removed, ...rest } = books;
    setBooks(rest);
    const bookKey = isLoggedIn && userProfile.email ? `waExamPrep_books_${userProfile.email}` : 'waExamPrep_books';
    localStorage.setItem(bookKey, JSON.stringify(rest));
  };

  const getBookId = (exam: ExamType, subject: Subject, year: string) => `${exam}-${subject}-${year}`;

  const getSubjectIcon = (subject: Subject) => {
    switch (subject) {
      // Compulsory
      case Subject.MATHEMATICS: return <Calculator className="w-5 h-5" />;
      case Subject.ENGLISH: return <BookA className="w-5 h-5" />;
      
      // Science
      case Subject.PHYSICS: return <Atom className="w-5 h-5" />;
      case Subject.CHEMISTRY: return <FlaskConical className="w-5 h-5" />;
      case Subject.BIOLOGY: return <Dna className="w-5 h-5" />;
      case Subject.FURTHER_MATHS: return <Calculator className="w-5 h-5 text-indigo-500" />;
      case Subject.AGRIC_SCIENCE: return <Leaf className="w-5 h-5" />;
      case Subject.GEOGRAPHY: return <Map className="w-5 h-5" />;
      
      // Commercial
      case Subject.ECONOMICS: return <TrendingUp className="w-5 h-5" />;
      case Subject.COMMERCE: return <Briefcase className="w-5 h-5" />;
      
      // Arts
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

  const years = Array.from({ length: 12 }, (_, i) => (2026 - i).toString());

  const allSubjectsWithExams = Object.values(ExamType).flatMap(exam =>
    Object.values(Subject).map(subject => ({ exam, subject }))
  );

  const filteredResults = searchQuery.trim().length > 0
    ? allSubjectsWithExams.filter(item =>
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.exam.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleStart = (bookId: string) => {
     if (books[bookId]) {
         const book = books[bookId];
         // Increment global usage for admin tracking
         const globalUsage = JSON.parse(localStorage.getItem('waExamPrep_global_usage') || '{}');
         const bookTitle = `${book.examType} ${book.subject} ${book.year}`;
         globalUsage[bookTitle] = (globalUsage[bookTitle] || 0) + 1;
         localStorage.setItem('waExamPrep_global_usage', JSON.stringify(globalUsage));

         trackEvent('feature_used', { name: 'practice_start', examType: book.examType, subject: book.subject, year: book.year });

         setQuestions(book.questions);
         setCurrentSources(books[bookId].sources || []);
         setActiveBookId(bookId);
         setScreen('PRACTICE');
     }
  };

  const handleDownload = async (year: string) => {
     if (!selectedExam || !selectedSubject) return;
     
     const bookId = getBookId(selectedExam, selectedSubject, year);
     
     setScreen('LOADING');
     try {
        const questionCount = selectedExam === ExamType.JAMB && selectedSubject === Subject.ENGLISH ? 60 : 50;
        const result = await fetchExamQuestions(selectedExam, selectedSubject, year, questionCount);
        
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
        
        saveBook(newBook);
        trackEvent('feature_used', { name: 'pack_download', examType: selectedExam, subject: selectedSubject, year: year });
        setScreen('YEAR_SELECT'); // Return to list so user can download more
     } catch (err) {
        alert("Could not download questions. Check your internet connection or try again.");
        setScreen('YEAR_SELECT');
     }
  };

  const handleFinishPractice = (score: number, total: number) => {
      setLastScore(score);
      setLastTotal(total);

      // PWA-only reward: award XP for correct answers, not for merely finishing.
      const xpGained = score * 10;
      setUserProfile(prev => ({
        ...prev,
        xp: prev.xp + xpGained,
        level: Math.floor((prev.xp + xpGained) / 1000) + 1,
        streak: score > 0 ? prev.streak + 1 : prev.streak
      }));

      // If we are in a book session, update the book's stats.
      if (activeBookId && books[activeBookId]) {
          const book = books[activeBookId];
          const updatedBook: Book = {
              ...book,
              attempts: (book.attempts || 0) + 1,
              lastScore: score,
              bestScore: Math.max(book.bestScore || 0, score)
          };
          saveBook(updatedBook);
      }

      if (supabaseUser) {
        const examYear = activeBookId && books[activeBookId] ? Number(books[activeBookId].year) : null;
        enqueueProgress(supabaseUser.id, {
          subject: selectedSubject || 'Random Study',
          examType: selectedExam || 'Study Rand',
          examYear: Number.isFinite(examYear) ? examYear : null,
          questionsAttempted: total,
          questionsCorrect: score,
          xpEarned: xpGained,
        });

        const achievementKey = score === total ? 'perfect_quiz' : (score / total) >= 0.8 ? 'quiz_excellence' : null;
        if (achievementKey) {
          const storageKey = `examply_achievements_${supabaseUser.id}`;
          const earned = JSON.parse(localStorage.getItem(storageKey) || '[]') as string[];
          if (!earned.includes(achievementKey)) {
            localStorage.setItem(storageKey, JSON.stringify([...earned, achievementKey]));
            enqueueAchievement(supabaseUser.id, {
              achievementKey,
              earnedAt: new Date().toISOString(),
            });
            trackEvent('achievement_earned', { name: achievementKey });
          }
        }

        if (navigator.onLine) void syncUserData(supabaseUser.id);
      }
      
      trackEvent('practice_finish', {
        questions_attempted: total,
        questions_correct: score,
        xp_earned: xpGained,
        percentage: total > 0 ? (score / total) * 100 : 0,
      });
      setScreen('RESULTS');
  };

  const resetApp = () => {
    setScreen('HOME');
    setSelectedExam(null);
    setSelectedStream(null);
    setSelectedSubject(null);
    setSelectedRandSubjects([]);
    setActiveBookId(null);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn('Supabase sign-out failed:', error);
    }
    localStorage.removeItem('waExamPrep_session');
    setIsLoggedIn(false);
    setUserProfile({
      level: 1,
      xp: 0,
      streak: 0,
      role: 'USER',
      timeSpent: 0,
      isBanned: false,
      showChatBot: true,
      chatBotPosition: null
    });
    setScreen('HOME');
  };

  const handleDeleteAccount = () => {
    alert('For safety, account deletion requires a server-side support workflow. No local or remote account data was deleted.');
  };

  if (authLoading) {
    return <LoadingScreen message="Restoring your secure session..." />;
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col relative pb-24 md:pb-8 transition-colors duration-300 ${offlineStudySurface ? 'bg-slate-950 text-slate-100' : 'bg-white text-gray-900'}`}>
      {/* Dynamic Header */}
      <header className={`sticky top-0 z-40 w-full glass-panel transition-all duration-500 ${offlineStudySurface ? 'bg-slate-950/90 border-slate-800' : 'border-gray-100'} ${screen === 'PRACTICE' ? '-translate-y-full opacity-0 invisible h-0' : 'translate-y-0 opacity-100 visible'}`}>
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetApp}>
            <div className="bg-primary-600 p-2.5 rounded-xl transition-transform">
                <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold leading-tight tracking-tight ${offlineStudySurface ? 'text-slate-100' : 'text-gray-900'}`}>Examply</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Mastery</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
             <button
                onClick={resetApp}
                className={`text-sm font-semibold transition-colors ${screen === 'HOME' ? 'text-primary-600' : offlineStudySurface ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
             >
                Home
             </button>
             <button
                onClick={() => setShowLibrary(true)}
                className={`text-sm font-semibold transition-colors ${showLibrary ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
             >
                My Library
             </button>
             <button
                onClick={() => setOfflineDarkMode((previous) => !previous)}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-colors ${offlineStudySurface ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-gray-50 border-gray-100 text-gray-500 hover:text-primary-600'}`}
                title={offlineDarkMode ? 'Use light study theme' : 'Use dark study theme'}
                aria-label={offlineDarkMode ? 'Use light study theme' : 'Use dark study theme'}
             >
                {offlineDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
             <button
                onClick={() => setScreen('PROFILE')}
                className={`text-sm font-semibold transition-colors ${screen === 'PROFILE' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
             >
                Profile
             </button>
             {userProfile.role === 'ADMIN' && (
               <button
                  onClick={() => setScreen('ADMIN')}
                  className={`text-sm font-semibold transition-colors ${screen === 'ADMIN' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
               >
                  Admin
               </button>
             )}
             {isLoggedIn ? (
               <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100"
               >
                  <LogOut className="w-4 h-4" /> Logout
               </button>
             ) : (
               <button
                  onClick={() => setScreen('AUTH')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all"
               >
                  <LogIn className="w-4 h-4" /> Sign In
               </button>
             )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setOfflineDarkMode((previous) => !previous)}
              className={`p-2.5 rounded-xl relative border transition-colors ${offlineStudySurface ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
              title={offlineDarkMode ? 'Use light study theme' : 'Use dark study theme'}
              aria-label={offlineDarkMode ? 'Use light study theme' : 'Use dark study theme'}
            >
              {offlineDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setScreen('PROFILE')}
              className={`p-2.5 rounded-xl relative border transition-colors ${offlineStudySurface ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}
            >
              <Library className={`w-5 h-5 ${offlineStudySurface ? 'text-slate-200' : 'text-gray-600'}`} />
              {Object.keys(books).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {Object.keys(books).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Nav for Mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 md:hidden border-t px-6 py-3 transition-all duration-500 ${offlineStudySurface ? 'border-slate-800 bg-slate-950' : 'border-gray-100 bg-white'} ${screen === 'PRACTICE' ? 'translate-y-full opacity-0 invisible' : 'translate-y-0 opacity-100 visible'}`}>
        <div className="flex items-center justify-around">
          <button
            onClick={resetApp}
            className={`flex flex-col items-center gap-1 ${screen === 'HOME' ? 'text-primary-600' : 'text-gray-400'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button
            onClick={() => setShowLibrary(true)}
            className={`flex flex-col items-center gap-1 ${showLibrary ? 'text-primary-600' : 'text-gray-400'}`}
          >
            <Library className="w-6 h-6" />
            <span className="text-[10px] font-bold">Library</span>
          </button>
          <button
            onClick={() => setScreen('PROFILE')}
            className={`flex flex-col items-center gap-1 ${screen === 'PROFILE' ? 'text-primary-600' : 'text-gray-400'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
          {userProfile.role === 'ADMIN' && (
            <button
              onClick={() => setScreen('ADMIN')}
              className={`flex flex-col items-center gap-1 ${screen === 'ADMIN' ? 'text-primary-600' : 'text-gray-400'}`}
            >
              <Scale className="w-6 h-6" />
              <span className="text-[10px] font-bold">Admin</span>
            </button>
          )}
        </div>
      </nav>

      <main className={`flex-1 max-w-5xl mx-auto w-full px-6 py-12 relative ${offlineStudySurface ? 'offline-dark-surface' : ''}`}>
        
        {screen === 'HOME' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-bold mb-6 tracking-widest uppercase">
                Offline Access Available
              </div>
              <h1
                className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight h-[2.5em] md:h-auto"
              >
                {displayText}
                <span className="text-primary-600 animate-pulse ml-1">_</span>
              </h1>
              <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-xl mx-auto mb-8">
                The smartest way to prepare for WAEC, JAMB & NECO. Download practice packs and study anywhere.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <a 
                  href="/builds/SphereLearn-latest.apk" 
                  download 
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl hover:shadow-gray-200"
                >
                  <div className="bg-white/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <DownloadCloud className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Android App</div>
                    <div className="text-sm">Download APK {apkMetadata?.version && `v${apkMetadata.version}`}</div>
                  </div>
                </a>
                <button 
                  onClick={() => {
                    const el = document.getElementById('exam-browse');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Browse Subjects</span>
                </button>
              </div>

              <div className="relative max-w-xl mx-auto">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search subjects (e.g. Mathematics, Physics...)"
                  className="w-full pl-14 pr-6 py-5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                />

                {isSearching && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden text-left">
                    {filteredResults.length > 0 ? (
                      filteredResults.map((res, i) => (
                        <button
                          key={`${res.exam}-${res.subject}`}
                          onClick={() => {
                            setSelectedExam(res.exam);
                            setSelectedSubject(res.subject);
                            setScreen('YEAR_SELECT');
                            setSearchQuery('');
                            setIsSearching(false);
                          }}
                          className={`w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                              {getSubjectIcon(res.subject)}
                            </div>
                            <span className="font-bold text-gray-900">{res.subject}</span>
                          </div>
                          <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
                            {res.exam}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-10 text-center text-gray-400 font-medium">
                        No subjects found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
                {isSearching && (
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsSearching(false)}
                  ></div>
                )}
              </div>
            </div>

            <div id="exam-browse" className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
                  Browse by Exam
                </h2>
                <div className="h-px w-full bg-gray-100"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ExamCard
                  type={ExamType.JAMB}
                  description="Joint Admissions & Matriculation Board"
                  onClick={(t) => { setSelectedExam(t); setScreen('STREAM_SELECT'); }}
                  colorClass="bg-indigo-500"
                />
                <ExamCard
                  type={ExamType.WAEC}
                  description="West African Senior School Certificate"
                  onClick={(t) => { setSelectedExam(t); setScreen('STREAM_SELECT'); }}
                  colorClass="bg-rose-500"
                />
                <ExamCard
                  type={ExamType.NECO}
                  description="National Examinations Council"
                  onClick={(t) => { setSelectedExam(t); setScreen('STREAM_SELECT'); }}
                  colorClass="bg-amber-500"
                />
                <ExamCard
                  type={ExamType.STUDY_RAND}
                  description="Randomized subject quiz and study"
                  onClick={(t) => { setSelectedExam(t); setScreen('STUDY_RAND_SUBJECTS'); }}
                  colorClass="bg-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {screen === 'STREAM_SELECT' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
             <button onClick={() => setScreen('HOME')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Exams
            </button>
            <h2 className="text-4xl font-black text-gray-900 mb-2">Select Department</h2>
            <p className="text-lg text-gray-500 mb-10 font-medium">Choose your study stream to see relevant subjects.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STREAMS.map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => { setSelectedStream(stream.id); setScreen('SUBJECT_SELECT'); }}
                  className="group p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-left flex flex-col"
                >
                  <div className={`w-16 h-16 rounded-2xl ${stream.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                    <stream.icon className={`w-8 h-8 ${stream.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{stream.label}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{stream.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 'SUBJECT_SELECT' && selectedStream && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={() => setScreen('STREAM_SELECT')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Departments
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                 <div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Pick a Subject</h2>
                    <p className="text-lg text-gray-500 font-medium">Which subject are we crushing today?</p>
                 </div>
                 <span className="inline-flex px-4 py-2 bg-primary-50 rounded-2xl text-xs font-bold text-primary-600 uppercase tracking-widest border border-primary-100">
                    {STREAMS.find(s => s.id === selectedStream)?.label}
                 </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUBJECTS_BY_STREAM[selectedStream].map((subject) => (
                <button
                  key={subject}
                  onClick={() => { setSelectedSubject(subject); setScreen('YEAR_SELECT'); }}
                  className="flex items-center p-5 bg-white border border-gray-100 rounded-2xl hover:border-primary-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mr-4 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                      {getSubjectIcon(subject)}
                  </div>
                  <span className="font-bold text-gray-700 group-hover:text-gray-900">{subject}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 'YEAR_SELECT' && selectedExam && selectedSubject && (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <button onClick={() => setScreen('SUBJECT_SELECT')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Subjects
                </button>

                <div className="bg-gradient-to-r from-primary-600 to-primary-900 p-8 rounded-[40px] mb-10 shadow-2xl shadow-primary-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest mb-3">
                                {selectedExam} Question Bank
                            </span>
                            <h2 className="text-4xl font-black text-white">{selectedSubject}</h2>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/20">
                            <div className="text-white">
                                {getSubjectIcon(selectedSubject)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black text-gray-900">Yearly Packs</h3>
                     <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                        <button 
                            onClick={() => setPracticeMode('STUDY')}
                            className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${practiceMode === 'STUDY' ? 'bg-white shadow-md text-primary-600' : 'text-gray-500'}`}
                        >
                            STUDY
                        </button>
                        <button 
                            onClick={() => setPracticeMode('TEST')}
                            className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${practiceMode === 'TEST' ? 'bg-white shadow-md text-primary-600' : 'text-gray-500'}`}
                        >
                            TEST
                        </button>
                     </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {years.map((year) => {
                        const bookId = getBookId(selectedExam, selectedSubject, year);
                        const isDownloaded = !!books[bookId];
                        const book = books[bookId];

                        return (
                            <div key={year} className="group bg-white p-5 rounded-[32px] border border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${isDownloaded ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-300'}`}>
                                        {year.slice(2)}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 text-lg">{year} Papers</div>
                                        <div className="text-xs font-bold flex items-center gap-3">
                                            {isDownloaded ? (
                                                <>
                                                    <span className="text-primary-600 flex items-center gap-1"><WifiOff className="w-3.5 h-3.5"/> OFFLINE READY</span>
                                                    {book.bestScore !== undefined && (book.attempts || 0) > 0 && (
                                                        <span className="text-primary-500 flex items-center gap-1">
                                                            <Trophy className="w-3.5 h-3.5" /> Best: {book.bestScore}/{book.questions.length}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-gray-400">Not Downloaded</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isDownloaded ? (
                                        <>
                                            <button 
                                                onClick={() => handleStart(bookId)}
                                                className="px-6 py-3 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2"
                                            >
                                                <Play className="w-4 h-4 fill-current" /> START
                                            </button>
                                            <button 
                                                onClick={() => { if(confirm('Delete this pack?')) deleteBook(bookId); }}
                                                className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => handleDownload(year)}
                                            className="px-6 py-3 bg-gray-50 text-gray-600 font-black rounded-2xl hover:bg-primary-600 hover:text-white transition-all flex items-center gap-2 group-hover:shadow-md"
                                        >
                                            <DownloadCloud className="w-4 h-4" /> DOWNLOAD
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {screen === 'LOADING' && (
             <LoadingScreen message={`Downloading ${selectedExam} ${selectedSubject} question pack...`} />
        )}

        {screen === 'PRACTICE' && selectedExam && selectedSubject && (
            <PracticeSession 
                questions={questions}
                sources={currentSources}
                examType={selectedExam}
                subject={selectedSubject}
                mode={practiceMode}
                onFinish={handleFinishPractice}
                onBack={() => setScreen(selectedExam === ExamType.STUDY_RAND ? 'STUDY_RAND_SUBJECTS' : 'YEAR_SELECT')}
            />
        )}

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

        {screen === 'PROFILE' && (
            <Profile
                user={userProfile}
                books={books}
                isLoggedIn={isLoggedIn}
                onDeleteBook={deleteBook}
                onBack={resetApp}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
                onLogin={() => setScreen('AUTH')}
                onUpdateSettings={(settings) => setUserProfile(prev => ({ ...prev, ...settings }))}
                referralSummary={referralSummary}
            />
        )}

        {screen === 'ADMIN' && (
            <AdminDashboard
                onBack={resetApp}
            />
        )}

        {screen === 'STUDY_RAND_SUBJECTS' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={() => setScreen('HOME')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                 <div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Randomized Study</h2>
                    <p className="text-lg text-gray-500 font-medium">Select subjects to take a 60-question random quiz.</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {Object.values(Subject).map((sub) => {
                const hasDownloadedData = (Object.values(books) as Book[]).some((book) => book.subject === sub && book.questions.length > 0);
                if (!hasDownloadedData) return null;

                return (
                  <button
                    key={sub}
                    onClick={() => {
                      setSelectedRandSubjects(prev =>
                        prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
                      );
                    }}
                    className={`flex items-center p-5 border rounded-2xl transition-all text-left group ${selectedRandSubjects.includes(sub) ? 'border-primary-500 bg-primary-50' : 'bg-white border-gray-100 hover:border-primary-300'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all ${selectedRandSubjects.includes(sub) ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600'}`}>
                        {getSubjectIcon(sub)}
                    </div>
                    <span className={`font-bold ${selectedRandSubjects.includes(sub) ? 'text-primary-900' : 'text-gray-700 group-hover:text-gray-900'}`}>{sub}</span>
                  </button>
                );
              })}
            </div>

            <div className="sticky bottom-24 md:bottom-8 flex justify-center">
               <button
                  disabled={selectedRandSubjects.length === 0}
                  onClick={() => {
                    // Gather questions from the packs already stored for offline use.
                    const pool: Question[] = (Object.values(books) as Book[])
                      .filter((book) => selectedRandSubjects.includes(book.subject))
                      .flatMap((book) => book.questions);

                    if (pool.length === 0) {
                      alert("No questions found for the selected subjects.");
                      return;
                    }

                    // Shuffle pool
                    const shuffled = [...pool].sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 60);

                    setQuestions(selected);
                    setSelectedExam(ExamType.STUDY_RAND);
                    setSelectedSubject(selectedRandSubjects.join(', ') as any); // Just for display
                    setPracticeMode('TEST');
                    setScreen('PRACTICE');
                  }}
                  className="px-12 py-5 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-2xl shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 scale-110"
               >
                  START RANDOM QUIZ <ArrowRight className="w-5 h-5" />
               </button>
            </div>
          </div>
        )}

        {screen === 'AUTH' && (
          <Auth
            onAuthComplete={(profile) => {
              setUserProfile(profile);
              setIsLoggedIn(true);
              setScreen('HOME');
            }}
            onBack={() => setScreen('HOME')}
          />
        )}
      </main>

      <ChatBot
        showChatBot={userProfile.showChatBot !== false}
        savedPosition={userProfile.chatBotPosition}
        onPositionChange={(pos) => setUserProfile(prev => ({ ...prev, chatBotPosition: pos }))}
        onHide={() => setUserProfile(prev => ({ ...prev, showChatBot: false }))}
      />

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) setShowLibrary(false); }}>
            <div className={`${offlineStudySurface ? 'offline-dark-surface bg-slate-900 border-slate-800' : 'bg-[#fafafa] border-white'} rounded-[40px] w-full max-w-xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden animate-scale-in border`}>
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary-50 p-3 rounded-2xl">
                          <Library className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-xl">My Library</h3>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{Object.keys(books).length} Saved Packs</p>
                        </div>
                    </div>
                    <button onClick={() => setShowLibrary(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="overflow-y-auto px-8 py-6 space-y-4 flex-1 sidebar-scrollbar bg-gray-50/50">
                    {Object.keys(books).length === 0 ? (
                        <div className="text-center text-gray-400 py-16 flex flex-col items-center">
                            <div className="bg-white p-6 rounded-[32px] mb-4 shadow-sm">
                                 <Library className="w-12 h-12 text-gray-200" />
                            </div>
                            <p className="text-lg font-black text-gray-900">Your library is empty.</p>
                            <p className="text-sm font-medium mt-1">Download packs to study offline.</p>
                        </div>
                    ) : (
                        (Object.values(books) as Book[]).sort((a,b) => b.dateCreated - a.dateCreated).map((book) => (
                            <div key={book.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[32px] hover:border-primary-300 transition-all shadow-sm hover:shadow-xl group">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 font-black text-lg group-hover:bg-primary-50 group-hover:text-primary-600 transition-all relative">
                                        {book.year.slice(2)}
                                        {book.bestScore !== undefined && (book.attempts || 0) > 0 && book.bestScore > (book.questions.length * 0.8) && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 rounded-full border-2 border-white animate-pulse"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 text-lg leading-tight">{book.subject}</div>
                                        <div className="text-xs text-gray-400 font-black flex items-center gap-3 mt-1">
                                            <span className="text-primary-600">{book.examType}</span>
                                            {book.bestScore !== undefined && (book.attempts || 0) > 0 && (
                                                <span className="text-primary-600 flex items-center gap-1">
                                                    <Trophy className="w-3.5 h-3.5" />
                                                    {book.bestScore}/{book.questions.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => { handleStart(book.id); setShowLibrary(false); }} 
                                        className="p-3.5 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all"
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
                                        className="p-3.5 bg-gray-50 text-gray-300 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
                                        title="Delete Pack"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                 <div className="p-8 bg-white border-t border-gray-50 text-center">
                    <button onClick={() => setShowLibrary(false)} className="w-full py-4 bg-gray-50 text-sm font-black text-gray-400 rounded-2xl hover:text-primary-600 hover:bg-primary-50 transition-all">
                        CLOSE LIBRARY
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppShell />
  </AuthProvider>
);

export default App;
