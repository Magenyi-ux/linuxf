
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
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans flex flex-col relative pb-24 md:pb-8">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetApp}>
            <div className="bg-gradient-to-br from-brand-600 to-accent-500 p-2.5 rounded-2xl shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 leading-tight tracking-tight">EXAMLY</span>
              <span className="text-[10px] font-bold text-accent-500 uppercase tracking-[0.2em]">Prep AI</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
             <button
                onClick={resetApp}
                className={`text-sm font-bold transition-colors ${screen === 'HOME' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
             >
                Home
             </button>
             <button
                onClick={() => setShowLibrary(true)}
                className={`text-sm font-bold transition-colors ${showLibrary ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
             >
                Library
             </button>
          </div>

          <button 
            onClick={() => setShowLibrary(true)}
            className="md:hidden p-2 bg-gray-100 rounded-xl relative"
          >
             <Library className="w-5 h-5 text-gray-600" />
             {Object.keys(books).length > 0 && (
               <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                 {Object.keys(books).length}
               </span>
             )}
          </button>
        </div>
      </header>

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] max-w-sm">
        <div className="glass-panel rounded-3xl shadow-2xl border border-white/50 p-2 flex items-center justify-around">
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 relative">
        
        {screen === 'HOME' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row items-center gap-12 mb-20 mt-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold mb-6 animate-bounce">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  OFFLINE ACCESS READY
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">
                  Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">Exams</span> with AI.
                </h1>
                <p className="text-xl text-gray-500 max-w-xl font-medium leading-relaxed">
                  The smartest way to prepare for WAEC, JAMB & NECO. Download practice packs and study anywhere, even without internet.
                </p>
              </div>
              <div className="hidden md:flex flex-1 justify-center relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-100 rounded-full blur-[80px] opacity-50"></div>
                  <div className="relative glass-panel p-8 rounded-[40px] shadow-2xl border border-white/50 max-w-xs rotate-3 hover:rotate-0 transition-transform duration-500">
                      <div className="bg-brand-500 w-full aspect-square rounded-3xl mb-4 flex items-center justify-center">
                          <Trophy className="w-20 h-20 text-white" />
                      </div>
                      <div className="space-y-2">
                          <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                          <div className="h-4 bg-gray-50 rounded-full w-1/2"></div>
                      </div>
                  </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                Select Your Exam
                <div className="h-px flex-1 bg-gray-100"></div>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              </div>
            </div>
          </div>
        )}

        {screen === 'STREAM_SELECT' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
             <button onClick={() => setScreen('HOME')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors">
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
            <button onClick={() => setScreen('STREAM_SELECT')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Departments
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                 <div>
                    <h2 className="text-4xl font-black text-gray-900 mb-2">Pick a Subject</h2>
                    <p className="text-lg text-gray-500 font-medium">Which subject are we crushing today?</p>
                 </div>
                 <span className="inline-flex px-4 py-2 bg-brand-50 rounded-2xl text-xs font-black text-brand-600 uppercase tracking-wider border border-brand-100">
                    {STREAMS.find(s => s.id === selectedStream)?.label}
                 </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUBJECTS_BY_STREAM[selectedStream].map((subject) => (
                <button
                  key={subject}
                  onClick={() => { setSelectedSubject(subject); setScreen('YEAR_SELECT'); }}
                  className="flex items-center p-5 bg-white border border-gray-100 rounded-[24px] hover:border-brand-500 hover:shadow-xl transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mr-4 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
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
                <button onClick={() => setScreen('SUBJECT_SELECT')} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Subjects
                </button>

                <div className="bg-gradient-to-r from-brand-600 to-brand-900 p-8 rounded-[40px] mb-10 shadow-2xl shadow-brand-500/20 relative overflow-hidden">
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
                            className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${practiceMode === 'STUDY' ? 'bg-white shadow-md text-brand-600' : 'text-gray-500'}`}
                        >
                            STUDY
                        </button>
                        <button 
                            onClick={() => setPracticeMode('TEST')}
                            className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${practiceMode === 'TEST' ? 'bg-white shadow-md text-brand-600' : 'text-gray-500'}`}
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
                            <div key={year} className="group bg-white p-5 rounded-[32px] border border-gray-100 hover:border-brand-200 hover:shadow-xl transition-all flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${isDownloaded ? 'bg-brand-50 text-brand-600' : 'bg-gray-50 text-gray-300'}`}>
                                        {year.slice(2)}
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 text-lg">{year} Papers</div>
                                        <div className="text-xs font-bold flex items-center gap-3">
                                            {isDownloaded ? (
                                                <>
                                                    <span className="text-accent-500 flex items-center gap-1"><WifiOff className="w-3.5 h-3.5"/> OFFLINE READY</span>
                                                    {book.bestScore !== undefined && book.attempts > 0 && (
                                                        <span className="text-brand-500 flex items-center gap-1">
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
                                                className="px-6 py-3 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                                            >
                                                <Play className="w-4 h-4 fill-current" /> START
                                            </button>
                                            <button 
                                                onClick={() => { if(confirm('Delete this pack?')) deleteBook(bookId); }}
                                                className="p-3 text-gray-300 hover:text-accent-600 hover:bg-accent-50 rounded-2xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => handleDownload(year)}
                                            className="px-6 py-3 bg-gray-50 text-gray-600 font-black rounded-2xl hover:bg-brand-600 hover:text-white transition-all flex items-center gap-2 group-hover:shadow-md"
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
