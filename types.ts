
export enum ExamType {
  JAMB = 'JAMB',
  WAEC = 'WAEC',
  NECO = 'NECO',
  STUDY_RAND = 'Study Rand'
}

export enum Subject {
  // Compulsory
  MATHEMATICS = 'Mathematics',
  ENGLISH = 'English Language',
  
  // Science
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  BIOLOGY = 'Biology',
  FURTHER_MATHS = 'Further Mathematics',
  AGRIC_SCIENCE = 'Agricultural Science',
  GEOGRAPHY = 'Geography',

  // Commercial
  ECONOMICS = 'Economics',
  COMMERCE = 'Commerce',

  // Arts
  GOVERNMENT = 'Government',
  LITERATURE = 'Literature in English',
  HISTORY = 'History',
  CIVIC_EDUCATION = 'Civic Education',
  CRS = 'CRS',
  IRS = 'IRS',
  FRENCH = 'French',
  ARABIC = 'Arabic'
}

export interface Question {
  id: string | number;
  text: string;
  imageUrl?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Book {
  id: string; // e.g. "JAMB-Mathematics-2023"
  examType: ExamType;
  subject: Subject;
  year: string;
  questions: Question[];
  sources: string[];
  dateCreated: number;
  // Progress Tracking
  bestScore?: number;
  lastScore?: number;
  attempts?: number;
  usageCount?: number;
}

export interface UserProfile {
  name?: string;
  email?: string;
  level: number;
  xp: number;
  streak: number;
  role: 'ADMIN' | 'USER';
  timeSpent: number; // in seconds
  isBanned: boolean;
}

export type ScreenState = 'HOME' | 'STREAM_SELECT' | 'SUBJECT_SELECT' | 'YEAR_SELECT' | 'LOADING' | 'PRACTICE' | 'RESULTS' | 'PROFILE' | 'CHAT' | 'AUTH' | 'ADMIN';
