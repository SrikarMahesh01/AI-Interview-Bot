export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type InterviewFormat = 'verbal' | 'coding';

export type InteractionMode = 'speech' | 'text';

export interface Domain {
  id: string;
  name: string;
  topics: string[];
}

export interface InterviewConfig {
  domain: string;
  difficulty: DifficultyLevel;
  topics: string[];
  format: InterviewFormat;
  interactionMode?: InteractionMode;
  duration?: number; // in minutes
  interviewType: 'specific' | 'general'; // specific area or general based on domain
  customDomain?: string; // User's custom domain input
  specificArea?: string; // Specific area if interviewType is 'specific'
}

export interface Question {
  id: string;
  question: string;
  type: 'verbal' | 'coding';
  difficulty: DifficultyLevel;
  topic: string;
  expectedAnswer?: string;
  testCases?: TestCase[];
  constraints?: string[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Answer {
  questionId: string;
  answer: string;
  code?: string;
  timestamp: Date;
  evaluation?: Evaluation;
}

export interface Evaluation {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  config: InterviewConfig;
  questions: Question[];
  answers: Answer[];
  startTime: Date;
  endTime?: Date;
  overallEvaluation?: OverallEvaluation;
  status: 'in-progress' | 'completed' | 'cancelled';
}

export interface OverallEvaluation {
  overallScore: number;
  topicWiseScores: { [topic: string]: number };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceSummary: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  interviewHistory: string[]; // Array of session IDs
}
