import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  DownloadCloud, 
  BrainCircuit, 
  ShieldCheck, 
  ChevronRight, 
  Smartphone, 
  WifiOff, 
  CheckCircle2, 
  Menu, 
  X, 
  Github, 
  Twitter, 
  Instagram,
  ArrowRight,
  MessageSquare,
  Search,
  Filter,
  GraduationCap,
  History,
  Trophy,
  User,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  Globe,
  Clock,
  Check,
  ChevronDown,
  Info
} from 'lucide-react';

// --- Types ---
type ExamType = 'WAEC' | 'JAMB' | 'NECO';
type Subject = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  questionCount: number;
};

// --- Main Component ---
export default function App() {
  // State
  const [screen, setScreen] = useState<'HOME' | 'STREAM_SELECT' | 'SUBJECT_SELECT' | 'YEAR_SELECT' | 'QUIZ' | 'RESULTS' | 'WAITLIST'>('HOME');
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsScrolledTyping] = useState(true);
  const [apkMetadata, setApkMetadata] = useState<{ version: string; updatedAt: string } | null>(null);

  const fullText = "The AI-Powered Study Platform for Nigerian Students.";
  
  // Effects
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let currentText = '';
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        currentText += fullText[index];
        setDisplayText(currentText);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const trackEvent = (event: string, props?: any) => {
    console.log(`[Event] ${event}`, props);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('waitlist_signup');
    alert("Thanks for joining! We'll keep you updated.");
  };

  const startExamPrep = (exam: ExamType) => {
    setSelectedExam(exam);
    setScreen('STREAM_SELECT');
    trackEvent('exam_selected', { exam });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Components
  const Navbar = () => (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('HOME')}>
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter">SphereLearn</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">How it Works</a>
            <button 
              onClick={() => setScreen('WAITLIST')}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-md hover:shadow-gray-200"
            >
              Join Waitlist
            </button>
          </div>

          <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );

  const Hero = () => (
    <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-bold mb-6 tracking-widest uppercase">
          Offline Access Available
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight h-[2.5em] md:h-auto">
          {displayText}
          <span className="text-primary-600 animate-pulse ml-1">_</span>
        </h1>
        <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-xl mx-auto mb-8">
          The smartest way to prepare for WAEC, JAMB & NECO. Download practice packs and study anywhere.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a 
            href="https://github.com/Magenyi-ux/icn/releases/latest/download/SphereLearn-latest.apk" 
            download="SphereLearn.apk" 
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl hover:shadow-gray-200"
          >
            <div className="bg-white/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <DownloadCloud className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Android App</div>
              <div className="text-sm">Download Application {apkMetadata?.version && `v${apkMetadata.version}`}</div>
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
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-[2.5rem] blur opacity-20"></div>
          <div className="relative bg-white border border-gray-100 rounded-[2rem] p-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Professor Online</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-600 px-4 py-3 rounded-2xl rounded-tl-none text-sm font-medium max-w-[80%]">
                  Hello! How can I help you study today?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary-600 text-white px-4 py-3 rounded-2xl rounded-tr-none text-sm font-medium max-w-[80%] shadow-lg shadow-primary-100">
                  Explain Newton's Second Law with examples from daily life.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Features = () => (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Why SphereLearn?</h2>
          <p className="text-gray-500 font-medium">Built for the unique needs of Nigerian students.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "AI Study Partner",
              desc: "Get instant, curriculum-aligned explanations for any topic. It's like having a personal tutor 24/7.",
              icon: <BrainCircuit className="w-6 h-6 text-primary-600" />,
              color: "bg-primary-50"
            },
            {
              title: "Offline First",
              desc: "Download practice questions and study materials to use without internet. No data? No problem.",
              icon: <WifiOff className="w-6 h-6 text-emerald-600" />,
              color: "bg-emerald-50"
            },
            {
              title: "Exam Analytics",
              desc: "Track your progress with detailed performance reports. Know exactly where you need to improve.",
              icon: <Zap className="w-6 h-6 text-amber-600" />,
              color: "bg-amber-50"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const ExamSelector = () => (
    <section id="exam-browse" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Ready to Start?</h2>
            <p className="text-gray-500 font-medium">Select your target examination to browse practice materials.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {(['WAEC', 'JAMB', 'NECO'] as ExamType[]).map((exam) => (
            <button
              key={exam}
              onClick={() => startExamPrep(exam)}
              className="group relative bg-white p-8 rounded-[2rem] border-2 border-gray-100 hover:border-primary-500 transition-all text-left shadow-sm hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <GraduationCap className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">{exam}</h3>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Practice Portal</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer className="bg-gray-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <BrainCircuit className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter">SphereLearn</span>
            </div>
            <p className="text-gray-400 font-medium max-w-sm leading-relaxed mb-8">
              Empowering the next generation of Nigerian leaders through accessible, AI-powered education.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary-500 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary-500 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary-500 transition-all">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-[10px] text-gray-500">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">AI Professor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Offline Mode</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Practice Packs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-[10px] text-gray-500">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500">
          <p>© 2024 SphereLearn Education. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );

  // Main Render Logic
  if (screen === 'HOME') {
    return (
      <div className="min-h-screen bg-white font-sans selection:bg-primary-100 selection:text-primary-900">
        <Navbar />
        <Hero />
        <Features />
        <ExamSelector />
        <Footer />
      </div>
    );
  }

  if (screen === 'WAITLIST') {
    return (
      <div className="min-h-screen bg-white font-sans pt-32">
        <div className="max-w-xl mx-auto px-4 text-center">
          <button onClick={() => setScreen('HOME')} className="mb-8 text-sm font-bold text-gray-400 hover:text-primary-600 flex items-center gap-2 mx-auto">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
          </button>
          <h2 className="text-4xl font-black text-gray-900 mb-6">Join the Revolution.</h2>
          <p className="text-gray-500 font-medium mb-12">Be the first to know when we launch new features and practice packs.</p>
          
          <form onSubmit={handleWaitlistSubmit} className="space-y-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              required
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            />
            <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200">
              Get Early Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
          <Sparkles className="w-10 h-10 text-primary-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-4">Content Coming Soon</h2>
        <p className="text-gray-500 font-medium mb-8">We're preparing the best {selectedExam} practice materials for you.</p>
        <button 
          onClick={() => setScreen('HOME')}
          className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
