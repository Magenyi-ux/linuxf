
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
import { ReviewAnswers } from './components/ReviewAnswers';
import { CountdownMenu } from './components/CountdownMenu';
import { GamificationBar } from './components/GamificationBar';
import { PDFUpload } from './components/PDFUpload';
import { PDFViewer } from './components/PDFViewer';
import { TheoryPractice } from './components/TheoryPractice';
// Removed ConvexSync as Convex integration is being disabled for now
// import { ConvexSync } from './components/ConvexSync';
import { fetchExamQuestions } from './services/geminiService';
import { savePDF, getAllPDFs, deletePDF } from './services/storageService';
import { 
  GraduationCap, ArrowRight, Library, DownloadCloud, BookOpen, 
  Trash2, Calculator, BookA, Atom, FlaskConical, Dna, 
  TrendingUp, Landmark, Feather, WifiOff, Play,
  Leaf, Briefcase, Globe, Scale, ScrollText, BookHeart, Moon, Map, X, Trophy, Calendar,
  Cloud, CloudOff, User, LogIn, LogOut, Clock, Search, Upload, MessageSquare
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
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSources, setCurrentSources] = useState<string[]>([]);
  const [practiceMode, setPracticeMode] = useState<'STUDY' | 'TEST'>('STUDY');
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [savedPdfs, setSavedPdfs] = useState<{id: string, name: string, data: File}[]>([]);
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  
  const [lastScore, setLastScore] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);
  const [lastAnswers, setLastAnswers] = useState<Record<number, number>>({});
  const [questionCount, setQuestionCount] = useState(15);

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

      // Load PDFs
      getAllPDFs().then(setSavedPdfs);
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
  const handleFinishPractice = async (score: number, total: number, answers: Record<number, number>) => {
      setLastScore(score);
      setLastTotal(total);
      setLastAnswers(answers);

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

  const handleResetData = () => {
      localStorage.clear();
      // Also clear IndexedDB if possible, or just the PDFs
      indexedDB.deleteDatabase('waExamPrep_DB');
      setUser(null);
      setBooks({});
      setScreen('AUTH');
      window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col relative">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 h-16 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={resetApp}>
            <div className="bg-brand-600 p-1.5 rounded-lg">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900 hidden sm:inline">WA Exam Prep</span>
            <span className="text-base sm:text-lg font-bold text-gray-900 inline sm:hidden">WA</span>
          </div>

          <div className="flex-1 max-w-sm mx-2 sm:mx-4 relative group">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects or years..."
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                }}
                onFocus={() => { if(searchQuery) setShowSearchResults(true); }}
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>

            {/* Global Search Results Dropdown */}
            {showSearchResults && searchQuery && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-up max-h-[400px] overflow-y-auto">
                    <div className="p-3 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between items-center">
                        <span>Quick Search Results</span>
                        <button onClick={() => setShowSearchResults(false)}><X className="w-3 h-3" /></button>
                    </div>
                    <div className="p-2">
                        {(() => {
                            const query = searchQuery.toLowerCase();
                            const results: React.ReactNode[] = [];

                            Object.values(ExamType).forEach(exam => {
                                Object.values(Subject).forEach(sub => {
                                    const examLower = exam.toLowerCase();
                                    const subLower = sub.toLowerCase();
                                    const combined = `${examLower} ${subLower}`;

                                    if (subLower.includes(query) || examLower.includes(query) || combined.includes(query)) {
                                        if (results.length < 8) {
                                            results.push(
                                                <button
                                                    key={`${exam}-${sub}`}
                                                    onClick={() => {
                                                        setSelectedExam(exam);
                                                        setSelectedSubject(sub);
                                                        setScreen('YEAR_SELECT');
                                                        setSearchQuery('');
                                                        setShowSearchResults(false);
                                                    }}
                                                    className="w-full text-left p-3 hover:bg-brand-50 rounded-xl transition-colors group/item"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-gray-100 p-2 rounded-lg group-hover/item:bg-white text-gray-500 group-hover/item:text-brand-600 transition-colors">
                                                            {getSubjectIcon(sub)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-sm">{sub}</div>
                                                            <div className="text-[10px] font-bold text-brand-600 uppercase">{exam} Reference Pack</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        }
                                    }
                                });
                            });

                            // Add year results if query looks like a year
                            const yearMatch = query.match(/\d{4}/);
                            if (yearMatch) {
                                const year = yearMatch[0];
                                results.push(
                                    <div key="year-header" className="mt-2 pt-2 border-t border-gray-50 px-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Year References</div>
                                );
                                Object.values(ExamType).slice(0, 3).forEach(exam => {
                                    results.push(
                                        <button
                                            key={`year-${exam}-${year}`}
                                            onClick={() => {
                                                setSelectedExam(exam);
                                                if(!selectedSubject) setSelectedSubject(Subject.MATHEMATICS);
                                                setScreen('YEAR_SELECT');
                                                setSearchQuery(year);
                                                setShowSearchResults(false);
                                            }}
                                            className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-brand-100 p-2 rounded-lg text-brand-600 font-bold text-xs">{year.slice(2)}</div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{year} Papers Reference</div>
                                                    <div className="text-[10px] text-gray-500 uppercase">{exam} Question Bank</div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                });
                            }

                            return results.length > 0 ? results : <div className="p-8 text-center text-gray-400 text-sm">No references found for "{searchQuery}"</div>;
                        })()}
                    </div>
                </div>
            )}
          </div>

          <div className="flex items-center gap-3">
              {/* Connection Status Indicator */}
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                  {isOnline ? (
                      <>
                          <Cloud className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Online</span>
                      </>
                  ) : (
                      <>
                          <CloudOff className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Offline Mode</span>
                      </>
                  )}
              </div>

              {/* Exam Countdowns */}
              <button
                onClick={() => setShowCountdowns(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
              >
                 <Clock className="w-4 h-4" />
                 <span className="hidden sm:inline">Countdowns</span>
              </button>

              {/* Study Plan Link */}
              <button
                onClick={() => setScreen('STUDY_PLAN')}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${screen === 'STUDY_PLAN' ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:text-brand-600 hover:bg-gray-50'}`}
              >
                 <Calendar className="w-4 h-4" />
                 <span className="hidden sm:inline">Plan</span>
              </button>

              {/* Library Button */}
              <button
                onClick={() => setShowLibrary(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
              >
                 <Library className="w-4 h-4" />
                 <span className="hidden sm:inline">{Object.keys(books).length} Packs</span>
              </button>

              {/* User Profile / Mock Login */}
              <div className="border-l border-gray-100 pl-3 ml-1">
                  <button
                    onClick={() => setScreen('PROFILE')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${screen === 'PROFILE' ? 'bg-brand-100 ring-2 ring-brand-500' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {user ? (
                        <div className="w-full h-full rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    ) : (
                        <User className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
              </div>
          </div>
        </div>
      </nav>

      {/* Gamification Bar */}
      {user && screen !== 'AUTH' && <GamificationBar profile={user} />}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 relative">
        
        {/* Home Screen: Exam Selection */}
        {screen === 'HOME' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                Pass WAEC & JAMB in one sitting.
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Download authentic past questions. Get instant, teacher-like explanations. <strong>Works offline.</strong>
              </p>
            </div>

            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Your Exam</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ExamCard 
                type={ExamType.JAMB} 
                description="Joint Admissions & Matriculation Board"
                onClick={(t) => { setSelectedExam(t); setScreen('STREAM_SELECT'); }}
                colorClass="bg-green-500"
              />
              <ExamCard 
                type={ExamType.WAEC} 
                description="West African Senior School Certificate"
                onClick={(t) => { setSelectedExam(t); setScreen('STREAM_SELECT'); }}
                colorClass="bg-yellow-500"
              />
              <ExamCard 
                type={ExamType.NECO} 
                description="National Examinations Council"
                onClick={(t) => { setSelectedExam(t); setScreen('STREAM_SELECT'); }}
                colorClass="bg-purple-500"
              />
            </div>
          </div>
        )}

        {/* Stream Selection: Department selection */}
        {screen === 'STREAM_SELECT' && (
          <div className="animate-fade-in">
             <button onClick={() => setScreen('HOME')} className="mb-6 flex items-center text-gray-500 hover:text-brand-600">
                <ArrowRight className="w-4 h-4 rotate-180 mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Department</h2>
            <p className="text-gray-500 mb-8">Choose your class stream to see relevant subjects.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STREAMS.map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => { setSelectedStream(stream.id); setScreen('SUBJECT_SELECT'); }}
                  className="group p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all text-left flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-lg ${stream.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stream.icon className={`w-6 h-6 ${stream.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{stream.label}</h3>
                  <p className="text-sm text-gray-500">{stream.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject Selection */}
        {screen === 'SUBJECT_SELECT' && selectedStream && (
          <div className="animate-fade-in">
            <button onClick={() => setScreen('STREAM_SELECT')} className="mb-6 flex items-center text-gray-500 hover:text-brand-600">
                <ArrowRight className="w-4 h-4 rotate-180 mr-2" /> Back to Departments
            </button>
            <div className="flex items-center gap-3 mb-6">
                 <h2 className="text-2xl font-bold text-gray-900">Pick a Subject</h2>
                 <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">{STREAMS.find(s => s.id === selectedStream)?.label}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUBJECTS_BY_STREAM[selectedStream]
                .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((subject) => (
                <button
                  key={subject}
                  onClick={() => { setSelectedSubject(subject); setScreen('YEAR_SELECT'); }}
                  className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 mr-4 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      {getSubjectIcon(subject)}
                  </div>
                  <span className="font-medium text-gray-800">{subject}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year Selection and Pack Management */}
        {screen === 'YEAR_SELECT' && selectedExam && selectedSubject && (
            <div className="animate-fade-in">
                <button onClick={() => setScreen('SUBJECT_SELECT')} className="mb-6 flex items-center text-gray-500 hover:text-brand-600">
                    <ArrowRight className="w-4 h-4 rotate-180 mr-2" /> Change Subject
                </button>

                <div className="bg-brand-50 border border-brand-100 p-6 rounded-2xl mb-8 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-900">{selectedSubject}</h2>
                        <p className="text-brand-700">{selectedExam} Question Bank</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                        {getSubjectIcon(selectedSubject)}
                    </div>
                </div>

                <div className="mb-8">
                    <button
                        onClick={() => setScreen('THEORY')}
                        className="w-full p-4 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl text-white flex items-center justify-between group hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-lg leading-tight">Practice Theory Questions</div>
                                <div className="text-brand-100 text-sm">Write essays and get instant AI grading</div>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                     <h3 className="font-bold text-gray-900">Yearly Packs</h3>
                     <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                            <span className="text-[10px] font-bold text-gray-400 uppercase pl-2">Questions:</span>
                            <select
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                className="bg-white border-none text-xs font-bold rounded-md px-2 py-0.5 outline-none focus:ring-1 focus:ring-brand-500"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setPracticeMode('STUDY')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${practiceMode === 'STUDY' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500'}`}
                            >
                                Study
                            </button>
                            <button
                                onClick={() => setPracticeMode('TEST')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${practiceMode === 'TEST' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500'}`}
                            >
                                Test
                            </button>
                        </div>
                     </div>
                </div>
                
                <div className="space-y-3">
                    {years.filter(y => y.includes(searchQuery)).map((year) => {
                        const bookId = getBookId(selectedExam, selectedSubject, year);
                        const isDownloaded = !!books[bookId];
                        const book = books[bookId];

                        return (
                            <div key={year} className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-brand-300 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${isDownloaded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {year.slice(2)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{year} Papers</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                            {isDownloaded ? (
                                                <>
                                                    <span className="text-green-600 flex items-center gap-1"><WifiOff className="w-3 h-3"/> Ready</span>
                                                    {book.bestScore !== undefined && (
                                                        <span className="text-brand-600 font-medium border-l border-gray-300 pl-2">
                                                            Best: {book.bestScore}/{book.questions.length}
                                                        </span>
                                                    )}
                                                </>
                                            ) : 'Requires Download'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isDownloaded ? (
                                        <>
                                            <button 
                                                onClick={() => handleStart(bookId)}
                                                className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
                                            >
                                                <Play className="w-4 h-4 fill-current" /> Start
                                            </button>
                                            <button 
                                                onClick={() => { if(confirm('Delete this pack?')) deleteBook(bookId); }}
                                                className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => handleDownload(year)}
                                            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center gap-2 group-hover:shadow-sm"
                                        >
                                            <DownloadCloud className="w-4 h-4" /> Download
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
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
                onReview={() => setScreen('REVIEW')}
                onHome={resetApp}
            />
        )}

        {/* Review Answers Screen */}
        {screen === 'REVIEW' && selectedExam && selectedSubject && (
            <ReviewAnswers
                questions={questions}
                userAnswers={lastAnswers}
                subject={selectedSubject}
                examType={selectedExam}
                onBack={() => setScreen('RESULTS')}
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
                onResetData={handleResetData}
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
                    {Object.keys(books).length === 0 && savedPdfs.length === 0 ? (
                        <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                 <Library className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="text-sm font-medium">Your library is empty.</p>
                            <p className="text-xs mt-1">Download packs to study offline.</p>
                        </div>
                    ) : (
                        <>
                        {Object.keys(books).length > 0 && <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-1">Exam Packs</div>}
                        {(Object.values(books) as Book[])
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
                        }

                        {savedPdfs.length > 0 && (
                            <div className="mt-6">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-1">Study Materials</div>
                                <div className="space-y-2">
                                    {savedPdfs.map((pdf) => (
                                        <div key={pdf.id} className="flex items-center justify-between p-3 bg-brand-50/30 border border-brand-100 rounded-xl hover:border-brand-300 transition-all shadow-sm group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-brand-600 shadow-sm">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-gray-900 text-sm truncate">{pdf.name}</div>
                                                    <div className="text-[10px] text-gray-500 font-medium">Local PDF Material</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setSelectedPdf(pdf.data); setScreen('PDF_VIEW'); setShowLibrary(false); }}
                                                    className="p-2 bg-brand-100 text-brand-700 rounded-lg hover:bg-brand-600 hover:text-white transition-all"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if(confirm('Delete this study material?')) {
                                                            await deletePDF(pdf.id);
                                                            const updated = await getAllPDFs();
                                                            setSavedPdfs(updated);
                                                        }
                                                    }}
                                                    className="p-2 bg-white text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        </>
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

      {/* Countdown Menu Modal */}
      <CountdownMenu isOpen={showCountdowns} onClose={() => setShowCountdowns(false)} />

      {/* PDF Upload Modal */}
      {showPdfUpload && (
          <PDFUpload
            onUpload={async (file) => {
                const id = Date.now().toString();
                await savePDF(id, file);
                const updated = await getAllPDFs();
                setSavedPdfs(updated);
                setSelectedPdf(file);
                setShowPdfUpload(false);
                setScreen('PDF_VIEW');
            }}
            onClose={() => setShowPdfUpload(false)}
          />
      )}
    </div>
  );
};

export default App;
