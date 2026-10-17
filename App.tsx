
import React, { useState, useEffect } from 'react';
// Vercel production deployment trigger: keep deployment aligned with latest main.
import { ScreenState, ExamType, Subject, Question, Book, UserProfile } from './types';
import { ExamCard } from './components/ExamCard';
import { LoadingScreen } from './components/LoadingScreen';
import { Results } from './components/Results';
import { PracticeSession } from './components/PracticeSession';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';
import { Auth } from './components/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { enqueueAchievement, enqueueProgress } from './services/offlineQueue';
import { deleteRemoteStudyPack, getRemoteAchievementKeys, getRemoteProgressTotals, getRemoteStudyPacks, syncUserData, upsertRemoteStudyPack } from './services/syncService';
import { fetchExamQuestions } from './services/questionService';
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
  const isLoggedIn = Boolean(supabaseUser);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [referralSummary, setReferralSummary] = useState<ReferralSummary | null>(null);
  const [cloudProgress, setCloudProgress] = useState({
    xp: 0,
    attempted: 0,
    correct: 0,
    streak: 0,
  });
  const [apkMetadata, setApkMetadata] = useState<{ version: string; updatedAt: string } | null>(null);
  const [offlineDarkMode, setOfflineDarkMode] = useState(() => {
    try {
      return localStorage.getItem('spherelearn_offline_dark_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredInstallPrompt(null);
    };

    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
  };

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
      if (authProfile) {
        setUserProfile((previous) => ({ ...previous, ...authProfile }));
      } else {
        setUserProfile((previous) => ({ ...previous, id: supabaseUser.id, email: supabaseUser.email || undefined }));
      }
      return;
    }

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
        const [totals, remoteAchievementKeys, fetchedRemotePacks] = await Promise.all([
          getRemoteProgressTotals(supabaseUser.id),
          getRemoteAchievementKeys(supabaseUser.id),
          getRemoteStudyPacks(supabaseUser.id),
        ]);
        if (!active) return;

        const achievementStorageKey = `examply_achievements_${supabaseUser.id}`;
        const localAchievementKeys = JSON.parse(localStorage.getItem(achievementStorageKey) || '[]') as string[];
        const mergedAchievementKeys = Array.from(new Set([...localAchievementKeys, ...remoteAchievementKeys]));
        localStorage.setItem(achievementStorageKey, JSON.stringify(mergedAchievementKeys));

        let remotePacks = fetchedRemotePacks;

        // Backfill packs downloaded before cloud library sync existed.
        const localBookKey = `waExamPrep_books_${userProfile.email || supabaseUser.email || supabaseUser.id}`;
        const localBooks = JSON.parse(localStorage.getItem(localBookKey) || '{}') as Record<string, Book>;
        if (Object.keys(localBooks).length > 0) {
          await Promise.all(Object.values(localBooks).map((book) => upsertRemoteStudyPack(supabaseUser.id, {
            packId: book.id,
            examType: String(book.examType),
            subject: String(book.subject),
            examYear: Number(book.year),
            bestScore: book.bestScore || 0,
            lastScore: book.lastScore || 0,
            attempts: book.attempts || 0,
            dateCreated: book.dateCreated,
          }).catch((error) => console.warn('Could not backfill study pack:', error))));
          remotePacks = await getRemoteStudyPacks(supabaseUser.id);
        }

        // Restore cloud-saved study packs on a new phone. Question content is fetched
        // from the same question service, while scores/attempt counts come from Supabase.
        if (remotePacks.length > 0) {
          const existingBooks = JSON.parse(localStorage.getItem(localBookKey) || '{}') as Record<string, Book>;
          const mergedBooks = { ...existingBooks };

          for (const remotePack of remotePacks) {
            const existing = mergedBooks[remotePack.packId];
            if (existing) {
              mergedBooks[remotePack.packId] = {
                ...existing,
                bestScore: Math.max(existing.bestScore || 0, remotePack.bestScore),
                lastScore: remotePack.lastScore,
                attempts: Math.max(existing.attempts || 0, remotePack.attempts),
                dateCreated: Math.min(existing.dateCreated || remotePack.dateCreated, remotePack.dateCreated),
              };
              continue;
            }

            try {
              const result = await fetchExamQuestions(
                remotePack.examType as ExamType,
                remotePack.subject as Subject,
                String(remotePack.examYear),
                remotePack.examType === ExamType.JAMB && remotePack.subject === Subject.ENGLISH ? 60 : 50
              );
              mergedBooks[remotePack.packId] = {
                id: remotePack.packId,
                examType: remotePack.examType as ExamType,
                subject: remotePack.subject as Subject,
                year: String(remotePack.examYear),
                questions: result.questions,
                sources: result.sources,
                dateCreated: remotePack.dateCreated,
                bestScore: remotePack.bestScore,
                lastScore: remotePack.lastScore,
                attempts: remotePack.attempts,
              };
            } catch (error) {
              console.warn(`Could not restore study pack ${remotePack.packId} yet:`, error);
            }
          }

          localStorage.setItem(localBookKey, JSON.stringify(mergedBooks));
          setBooks(mergedBooks);
        }

        setCloudProgress(totals);
        setUserProfile((previous) => ({
          ...previous,
          xp: totals.xp,
          level: Math.floor(totals.xp / 1000) + 1,
          streak: totals.streak,
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

      if (supabaseUser) {
        void upsertRemoteStudyPack(supabaseUser.id, {
          packId: book.id,
          examType: String(book.examType),
          subject: String(book.subject),
          examYear: Number(book.year),
          bestScore: book.bestScore || 0,
          lastScore: book.lastScore || 0,
          attempts: book.attempts || 0,
          dateCreated: book.dateCreated,
        }).catch((error) => console.warn('Study pack cloud sync deferred:', error));
      }
    } catch (e) {
      alert("Storage Full! Your device storage is full. Please delete some old question packs from the Library to save new ones.");
    }
  };

  const deleteBook = (bookId: string) => {
    const { [bookId]: removed, ...rest } = books;
    setBooks(rest);
    const bookKey = isLoggedIn && userProfile.email ? `waExamPrep_books_${userProfile.email}` : 'waExamPrep_books';
    localStorage.setItem(bookKey, JSON.stringify(rest));
    if (supabaseUser) {
      void deleteRemoteStudyPack(supabaseUser.id, bookId).catch((error) => console.warn('Study pack cloud delete deferred:', error));
    }
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
            lastScore: 0,
            attempts: 0,
        };
        saveBook(newBook);
        setScreen('YEAR_SELECT');
     } catch (error) {
        console.error(error);
        setScreen('YEAR_SELECT');
        alert('Failed to load questions. Please check your connection and try again.');
     }
  };

  const resetApp = () => {
    setScreen('HOME');
    setSelectedExam(null);
    setSelectedStream(null);
    setSelectedSubject(null);
    setSelectedRandSubjects([]);
    setQuestions([]);
    setCurrentSources([]);
    setPracticeMode('STUDY');
  };

  const handleFinishPractice = (score: number, total: number) => {
    setLastScore(score);
    setLastTotal(total);
    setScreen('RESULTS');

    if (activeBookId && books[activeBookId]) {
      const currentBook = books[activeBookId];
      const updatedBook = {
        ...currentBook,
        attempts: (currentBook.attempts || 0) + 1,
        lastScore: score,
        bestScore: Math.max(currentBook.bestScore || 0, score),
      };
      saveBook(updatedBook);
    }

    const xpGained = score * 10;
    setUserProfile((prev) => ({
      ...prev,
      xp: prev.xp + xpGained,
      level: Math.floor((prev.xp + xpGained) / 1000) + 1,
      streak: prev.streak + 1,
    }));

    if (supabaseUser) {
      void enqueueProgress(supabaseUser.id, {
        subject: selectedSubject || 'Mixed',
        examType: selectedExam || 'Mixed',
        examYear: selectedExam === ExamType.STUDY_RAND ? 0 : Number((books[activeBookId || '']?.year || '0')),
        questionsAttempted: total,
        questionsCorrect: score,
        xpEarned: xpGained,
      }).then(() => {
        if (navigator.onLine) {
          void syncUserData(supabaseUser.id).catch((error) => console.warn('Immediate progress sync deferred:', error));
        }
      });

      if (navigator.onLine) {
        void syncUserData(supabaseUser.id)
          .then(async () => {
            const totals = await getRemoteProgressTotals(supabaseUser.id);
            setCloudProgress(totals);
            setUserProfile((previous) => ({
              ...previous,
              xp: totals.xp,
              level: Math.floor(totals.xp / 1000) + 1,
              streak: totals.streak,
            }));
          })
          .catch((error) => console.warn('Post-practice cloud progress refresh deferred:', error));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setScreen('HOME');
      setCloudProgress({ xp: 0, attempted: 0, correct: 0, streak: 0 });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!supabaseUser) return;
    const confirmed = window.confirm('Delete your account? This cannot be undone.');
    if (!confirmed) return;
    alert('Account deletion requires administrator confirmation. Please contact support.');
  };

  return (
    <div className={offlineStudySurface ? 'offline-dark min-h-screen' : 'min-h-screen'}>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <button onClick={resetApp} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">Examply</span>
          </button>

          <div className="flex items-center gap-2">
            {isLoggedIn && deferredInstallPrompt && !isInstalled && (
              <button onClick={handleInstallApp} className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-xs font-black hover:bg-primary-100 transition-colors">
                <DownloadCloud className="w-4 h-4" /> Install App
              </button>
            )}
            {isLoggedIn && deferredInstallPrompt && !isInstalled && (
              <button onClick={handleInstallApp} className="md:hidden p-3 bg-primary-50 text-primary-700 rounded-xl" aria-label="Install app">
                <DownloadCloud className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setScreen(isLoggedIn ? 'PROFILE' : 'AUTH')} className="p-3 hover:bg-gray-50 rounded-xl transition-colors">
              {isLoggedIn ? <User className="w-5 h-5 text-gray-700" /> : <LogIn className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 pb-28">
        {screen === 'HOME' && (
          <div className="animate-fade-in">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                <WifiOff className="w-4 h-4" /> Offline First Learning
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-6 leading-[0.95]">{displayText}<span className="text-primary-600">|</span></h1>
              <p className="text-lg text-gray-500 font-medium">Practice JAMB, WAEC and NECO past questions with offline-first study tools.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mb-14">
              {STREAMS.map(stream => (
                <button key={stream.id} onClick={() => { setSelectedStream(stream.id); setScreen('EXAM_SELECT'); }} className="text-left p-6 bg-white border border-gray-100 rounded-[32px] hover:border-primary-300 hover:shadow-xl transition-all group">
                  <div className={`w-14 h-14 ${stream.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                    <stream.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{stream.label}</h3>
                  <p className="text-sm text-gray-500 font-medium">{stream.description}</p>
                </button>
              ))}
            </div>

            <div className="bg-gray-900 text-white rounded-[40px] p-8 md:p-12 overflow-hidden relative">
              <div className="absolute -right-20 -top-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <p className="text-primary-400 text-xs font-black uppercase tracking-widest mb-3">Built for low connectivity</p>
                  <h2 className="text-3xl md:text-4xl font-black mb-3">Download once. Study anywhere.</h2>
                  <p className="text-gray-400 max-w-xl">Keep question packs on your device and continue studying when your connection disappears.</p>
                </div>
                <button onClick={() => setScreen('EXAM_SELECT')} className="shrink-0 px-7 py-4 bg-primary-600 hover:bg-primary-700 rounded-2xl font-black transition-all flex items-center gap-2">
                  Start Studying <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {screen === 'EXAM_SELECT' && selectedStream && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={() => setScreen('HOME')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
            <h2 className="text-4xl font-black text-gray-900 mb-3">Choose your exam</h2>
            <p className="text-gray-500 mb-10">Select a past-question bank to download for offline study.</p>
            <div className="grid md:grid-cols-3 gap-5">
              {Object.values(ExamType).filter(e => e !== ExamType.STUDY_RAND).map(exam => (
                <button key={exam} onClick={() => { setSelectedExam(exam); setScreen('SUBJECT_SELECT'); }} className="p-7 bg-white border border-gray-100 rounded-[32px] text-left hover:border-primary-300 hover:shadow-xl transition-all">
                  <h3 className="text-2xl font-black text-gray-900">{exam}</h3>
                  <p className="text-sm text-gray-500 mt-2">Past questions and offline practice.</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 'SUBJECT_SELECT' && selectedExam && selectedStream && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={() => setScreen('EXAM_SELECT')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Exams</button>
            <h2 className="text-4xl font-black text-gray-900 mb-8">Select a subject</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUBJECTS_BY_STREAM[selectedStream].map(subject => (
                <button key={subject} onClick={() => { setSelectedSubject(subject); setScreen('YEAR_SELECT'); }} className="p-5 bg-white border border-gray-100 rounded-2xl text-left hover:border-primary-300 hover:shadow-lg transition-all flex items-center gap-4">
                  <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">{getSubjectIcon(subject)}</div>
                  <span className="font-black text-gray-900">{subject}</span>
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
                cloudProgress={cloudProgress}
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
              setScreen('HOME');
            }}
            onBack={() => setScreen('HOME')}
          />
        )}
      </main>

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
