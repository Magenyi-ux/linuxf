
import React, { useState, useEffect } from 'react';
import { ScreenState, ExamType, Subject, Question, Book } from './types';
import { ExamCard } from './components/ExamCard';
import { LoadingScreen } from './components/LoadingScreen';
import { Results } from './components/Results';
import { PracticeSession } from './components/PracticeSession';
import { ChatBot } from './components/ChatBot';
import { fetchExamQuestions } from './services/geminiService';
import { 
  GraduationCap, ArrowRight, Library, DownloadCloud, BookOpen, 
  Trash2, Calculator, BookA, Atom, FlaskConical, Dna, 
  TrendingUp, Landmark, Feather, WifiOff, Play,
  Leaf, Briefcase, Globe, Scale, ScrollText, BookHeart, Moon, Map, X, Trophy, Home, ArrowLeft
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

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('HOME');
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSources, setCurrentSources] = useState<string[]>([]);
  const [practiceMode, setPracticeMode] = useState<'STUDY' | 'TEST'>('STUDY');
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  
  const [lastScore, setLastScore] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);

  const [books, setBooks] = useState<Record<string, Book>>({}); 

  useEffect(() => {
    try {
      const savedBooks = localStorage.getItem('waExamPrep_books');
      if (savedBooks) setBooks(JSON.parse(savedBooks));
    } catch (e) {
      console.error("Failed to load books from storage", e);
    }
  }, []);

  const saveBook = (book: Book) => {
    try {
      const newBooks = { ...books, [book.id]: book };
      setBooks(newBooks);
      localStorage.setItem('waExamPrep_books', JSON.stringify(newBooks));
    } catch (e) {
      alert("Storage Full! Your device storage is full. Please delete some old question packs from the Library to save new ones.");
    }
  };

  const deleteBook = (bookId: string) => {
    const { [bookId]: removed, ...rest } = books;
    setBooks(rest);
    localStorage.setItem('waExamPrep_books', JSON.stringify(rest));
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

  const years = Array.from({ length: 15 }, (_, i) => (2024 - i).toString());

  const handleStart = (bookId: string) => {
     const book = books[bookId];
     if (book) {
         setQuestions(book.questions);
         setCurrentSources(book.sources || []);
         setSelectedExam(book.examType);
         setSelectedSubject(book.subject);
         setActiveBookId(bookId);
         setScreen('PRACTICE');
     }
  };

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
        
        saveBook(newBook);
        setScreen('YEAR_SELECT'); // Return to list so user can download more
     } catch (err) {
        alert("Could not download questions. Check your internet connection or try again.");
        setScreen('YEAR_SELECT');
     }
  };

  const handleFinishPractice = (score: number, total: number) => {
      setLastScore(score);
      setLastTotal(total);

      // If we are in a book session, update the book's stats
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
      
      setScreen('RESULTS');
  };

  const resetApp = () => {
    setScreen('HOME');
    setSelectedExam(null);
    setSelectedStream(null);
    setSelectedSubject(null);
    setActiveBookId(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans flex flex-col relative pb-32">
      {/* App-like Minimal Header */}
      <header className="sticky top-0 z-40 w-full bg-[#fafafa]/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-xl mx-auto px-6 h-16 flex items-center justify-between">
           {screen !== 'HOME' ? (
              <button
                onClick={() => {
                    if (screen === 'STREAM_SELECT') setScreen('HOME');
                    else if (screen === 'SUBJECT_SELECT') setScreen('STREAM_SELECT');
                    else if (screen === 'YEAR_SELECT') setScreen('SUBJECT_SELECT');
                    else if (screen === 'PRACTICE') setScreen('YEAR_SELECT');
                    else resetApp();
                }}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-900" />
              </button>
           ) : (
              <div className="w-8"></div>
           )}

           <div className="flex flex-col items-center">
              <span className="text-sm font-black text-gray-900 tracking-tight">
                {screen === 'HOME' ? 'EXAMLY' : screen.replace('_', ' ')}
              </span>
              {screen === 'HOME' && <span className="text-[8px] font-bold text-brand-600 uppercase tracking-widest">PREP AI</span>}
           </div>

           <button
            onClick={() => setShowLibrary(true)}
            className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors relative"
           >
              <Library className="w-5 h-5 text-gray-900" />
              {Object.keys(books).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-600 rounded-full border border-white"></span>
              )}
           </button>
        </div>
      </header>

      {/* Persistent Bottom Nav (App-style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 pb-safe">
        <div className="max-w-xl mx-auto px-6 h-20 flex items-center justify-around">
          <button
            onClick={resetApp}
            className={`p-4 rounded-2xl transition-all ${screen === 'HOME' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-gray-400'}`}
          >
            <Home className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowLibrary(true)}
            className={`p-4 rounded-2xl transition-all ${showLibrary ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-gray-400'}`}
          >
            <Library className="w-6 h-6" />
          </button>
          <button
            onClick={() => {}}
            className="p-4 rounded-2xl text-gray-400"
          >
            <Trophy className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-8 relative">
        {screen === 'HOME' && (
          <div className="animate-fade-in space-y-10">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mt-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-gray-500 font-bold text-sm">Welcome back, Scholar!</p>
              </div>
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-brand-100 flex items-center justify-center text-brand-600 font-black text-xs">
                     {String.fromCharCode(64 + i)}
                   </div>
                 ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-brand-600 p-6 rounded-[32px] text-white shadow-xl shadow-brand-500/20">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Library className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-black">{Object.keys(books).length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Saved Packs</div>
               </div>
               <div className="bg-accent-500 p-6 rounded-[32px] text-white shadow-xl shadow-accent-500/20">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-black">
                    {Object.values(books).length > 0
                      ? Math.max(...Object.values(books).map(b => b.bestScore || 0))
                      : 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">High Score</div>
               </div>
            </div>

            {/* Exam Selection - Compact */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900">Start Practice</h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[10px] font-black">
                  <WifiOff className="w-3 h-3" /> OFFLINE READY
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => { setSelectedExam(ExamType.JAMB); setScreen('STREAM_SELECT'); }}
                  className="w-full p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                       <GraduationCap className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                       <div className="font-black text-lg text-gray-900">JAMB</div>
                       <div className="text-xs font-bold text-gray-400">Joint Admissions Board</div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => { setSelectedExam(ExamType.WAEC); setScreen('STREAM_SELECT'); }}
                  className="w-full p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                       <BookOpen className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                       <div className="font-black text-lg text-gray-900">WAEC</div>
                       <div className="text-xs font-bold text-gray-400">West African Senior Certificate</div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => { setSelectedExam(ExamType.NECO); setScreen('STREAM_SELECT'); }}
                  className="w-full p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                       <Feather className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                       <div className="font-black text-lg text-gray-900">NECO</div>
                       <div className="text-xs font-bold text-gray-400">National Exam Council</div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Recent Packs in Library (Mini List) */}
            {Object.keys(books).length > 0 && (
                <div>
                   <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900">My Library</h2>
                        <button onClick={() => setShowLibrary(true)} className="text-brand-600 font-black text-xs uppercase tracking-widest">View All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
                        {(Object.values(books) as Book[]).slice(0, 3).map(book => (
                             <button
                                key={book.id}
                                onClick={() => handleStart(book.id)}
                                className="flex-shrink-0 w-48 p-5 bg-white rounded-[32px] border border-gray-100 shadow-sm text-left group"
                             >
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mb-4 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                    {getSubjectIcon(book.subject)}
                                </div>
                                <div className="font-black text-gray-900 truncate mb-1">{book.subject}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{book.examType} • {book.year}</div>
                             </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}

        {screen === 'STREAM_SELECT' && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Select Department</h2>
              <p className="text-sm text-gray-500 font-bold">Choose your field of study</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {STREAMS.map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => { setSelectedStream(stream.id); setScreen('SUBJECT_SELECT'); }}
                  className="group p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all text-left flex items-center gap-5"
                >
                  <div className={`w-14 h-14 rounded-2xl ${stream.color} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stream.icon className={`w-7 h-7 ${stream.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900">{stream.label}</h3>
                    <p className="text-xs text-gray-400 font-bold">{stream.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-200 group-hover:text-brand-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 'SUBJECT_SELECT' && selectedStream && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-black text-gray-900">Pick a Subject</h2>
                    <p className="text-sm text-gray-500 font-bold">{STREAMS.find(s => s.id === selectedStream)?.label} Stream</p>
                 </div>
                 <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                    <BookOpen className="w-5 h-5" />
                 </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {SUBJECTS_BY_STREAM[selectedStream].map((subject) => (
                <button
                  key={subject}
                  onClick={() => { setSelectedSubject(subject); setScreen('YEAR_SELECT'); }}
                  className="flex items-center p-4 bg-white border border-gray-100 rounded-[24px] hover:border-brand-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mr-4 group-hover:bg-brand-600 group-hover:text-white transition-all">
                      {getSubjectIcon(subject)}
                  </div>
                  <span className="font-black text-gray-700 group-hover:text-gray-900">{subject}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === 'YEAR_SELECT' && selectedExam && selectedSubject && (
            <div className="animate-fade-in space-y-8">
                <div className="bg-brand-600 p-8 rounded-[32px] text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            {getSubjectIcon(selectedSubject)}
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{selectedExam}</div>
                            <h2 className="text-2xl font-black leading-tight">{selectedSubject}</h2>
                        </div>
                    </div>
                </div>

                <div>
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Select Year</h3>
                        <div className="flex bg-gray-100 p-1 rounded-2xl">
                            <button
                                onClick={() => setPracticeMode('STUDY')}
                                className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all ${practiceMode === 'STUDY' ? 'bg-white shadow-md text-brand-600' : 'text-gray-500'}`}
                            >
                                STUDY
                            </button>
                            <button
                                onClick={() => setPracticeMode('TEST')}
                                className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all ${practiceMode === 'TEST' ? 'bg-white shadow-md text-brand-600' : 'text-gray-500'}`}
                            >
                                TEST
                            </button>
                        </div>
                     </div>
                
                    <div className="space-y-3">
                    {years.map((year) => {
                        const bookId = getBookId(selectedExam, selectedSubject, year);
                        const isDownloaded = !!books[bookId];
                        const book = books[bookId];

                        return (
                            <div key={year} className="group bg-white p-4 rounded-[28px] border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${isDownloaded ? 'bg-brand-50 text-brand-600' : 'bg-gray-50 text-gray-300'}`}>
                                        {year.slice(2)}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900">{year} Exam</div>
                                        <div className="text-[10px] font-bold flex items-center gap-2">
                                            {isDownloaded ? (
                                                <span className="text-accent-500 flex items-center gap-1 uppercase tracking-tight">Downloaded</span>
                                            ) : (
                                                <span className="text-gray-300 uppercase tracking-tight">Unavailable</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isDownloaded ? (
                                        <button
                                            onClick={() => handleStart(bookId)}
                                            className="p-3 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/20"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleDownload(year)}
                                            className="p-3 bg-gray-50 text-gray-400 rounded-xl"
                                        >
                                            <DownloadCloud className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
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
                onBack={() => setScreen('YEAR_SELECT')}
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
      </main>

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) setShowLibrary(false); }}>
            <div className="bg-[#fafafa] rounded-[40px] w-full max-w-xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden animate-scale-in border border-white">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-50 p-3 rounded-2xl">
                          <Library className="w-6 h-6 text-brand-600" />
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
                            <div key={book.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[32px] hover:border-brand-300 transition-all shadow-sm hover:shadow-xl group">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 font-black text-lg group-hover:bg-brand-50 group-hover:text-brand-600 transition-all relative">
                                        {book.year.slice(2)}
                                        {book.bestScore !== undefined && book.attempts > 0 && book.bestScore > (book.questions.length * 0.8) && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-white animate-pulse"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 text-lg leading-tight">{book.subject}</div>
                                        <div className="text-xs text-gray-400 font-black flex items-center gap-3 mt-1">
                                            <span className="text-brand-600">{book.examType}</span>
                                            {book.bestScore !== undefined && book.attempts > 0 && (
                                                <span className="text-accent-500 flex items-center gap-1">
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
                                        className="p-3.5 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all"
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
                                        className="p-3.5 bg-gray-50 text-gray-300 rounded-2xl hover:bg-accent-50 hover:text-accent-600 transition-all"
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
                    <button onClick={() => setShowLibrary(false)} className="w-full py-4 bg-gray-50 text-sm font-black text-gray-400 rounded-2xl hover:text-brand-600 hover:bg-brand-50 transition-all">
                        CLOSE LIBRARY
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* AI Chat Bot Overlay */}
      <ChatBot />
    </div>
  );
};

export default App;
