
import React, { useState, useEffect, useCallback } from 'react';
import { ScreenState, ExamType, Subject, Question, Book } from './types';
import { ExamCard } from './components/ExamCard';
import { LoadingScreen } from './components/LoadingScreen';
import { Results } from './components/Results';
import { PracticeSession } from './components/PracticeSession';
import { StudyPlanner } from './components/StudyPlanner';
import { ChatBot } from './components/ChatBot';
import { fetchExamQuestions } from './services/geminiService';
import { 
  GraduationCap, ArrowRight, Library, DownloadCloud, BookOpen, 
  Trash2, Calculator, BookA, Atom, FlaskConical, Dna, 
  TrendingUp, Landmark, Feather, WifiOff, Play,
  Leaf, Briefcase, Globe, Scale, ScrollText, BookHeart, Moon, Map, X, Trophy, Calendar,
  CloudOff, User
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

  const saveBook = useCallback(async (book: Book) => {
    try {
      const newBooks = { ...books, [book.id]: book };
      setBooks(newBooks);
      localStorage.setItem('waExamPrep_books', JSON.stringify(newBooks));
    } catch (e) {
      console.error("Failed to save book", e);
    }
  }, [books]);

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
     if (books[bookId]) {
         setQuestions(books[bookId].questions);
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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col relative">
      <nav className="bg-white border-b border-gray-200 h-16 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="bg-brand-600 p-1.5 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">WA Exam Prep</span>
          </div>
          
          <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                  <CloudOff className="w-3.5 h-3.5 text-gray-300" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Offline Mode</span>
              </div>

              <button
                onClick={() => setScreen('STUDY_PLAN')}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${screen === 'STUDY_PLAN' ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:text-brand-600 hover:bg-gray-50'}`}
              >
                 <Calendar className="w-4 h-4" />
                 <span className="hidden sm:inline">Plan</span>
              </button>

              <button
                onClick={() => setShowLibrary(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
              >
                 <Library className="w-4 h-4" />
                 <span className="hidden sm:inline">{Object.keys(books).length} Packs</span>
              </button>

              <div className="border-l border-gray-100 pl-3 ml-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                  </div>
              </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 relative">
        
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
              {SUBJECTS_BY_STREAM[selectedStream].map((subject) => (
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

                <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-gray-900">Yearly Packs</h3>
                     <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setPracticeMode('STUDY')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${practiceMode === 'STUDY' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500'}`}
                        >
                            Study Mode
                        </button>
                        <button 
                            onClick={() => setPracticeMode('TEST')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${practiceMode === 'TEST' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500'}`}
                        >
                            Test Mode
                        </button>
                     </div>
                </div>
                
                <div className="space-y-3">
                    {years.map((year) => {
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

        {screen === 'STUDY_PLAN' && (
            <StudyPlanner onBack={() => setScreen('HOME')} />
        )}
      </main>

      {/* AI Chat Bot Overlay */}
      <ChatBot />
    </div>
  );
};

export default App;
