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