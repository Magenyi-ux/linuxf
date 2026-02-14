
export enum ExamType {
  JAMB = 'JAMB',
  WAEC = 'WAEC',
  NECO = 'NECO'
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
  id: number;
  text: string;
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
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  streak: number;
  joinedDate: number;
}

export interface Countdown {
  id: string;
  name: string;
  date: number; // timestamp
  isDefault?: boolean;
}

export interface StudyPlanTask {
  id: string;
  subject: Subject;
  examType: ExamType;
  description: string;
  completed: boolean;
  dueDate: number;
}

export type ScreenState = 'HOME' | 'STREAM_SELECT' | 'SUBJECT_SELECT' | 'YEAR_SELECT' | 'LOADING' | 'PRACTICE' | 'RESULTS' | 'STUDY_PLAN' | 'PROFILE' | 'AUTH';
