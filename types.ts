
export type AppView = 'home' | 'plagiarism' | 'ai-detector' | 'question-gen' | 'paraphraser' | 'image-editor' | 'immersive-study' | 'ai-supervisor';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type QuestionFormat = 'options' | 'open' | 'mixed';

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

export type LearningStyle = 'visual' | 'auditory';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  joinedAt: number;
}

export interface GeneratedQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  summary: string;
  visualMetaphor: string;
  keyPoints: string[];
}

export interface StudyOutline {
  materialTitle: string;
  topics: StudyTopic[];
}

export interface QuizHistoryItem {
  id: string;
  timestamp: number;
  questions: GeneratedQuestion[];
  userAnswers: Record<number, string>;
  score: number;
  difficulty: DifficultyLevel;
  format: QuestionFormat;
  accuracy: number;
}

export interface QuizResult {
  id: string;
  timestamp: number;
  score: number;
  totalQuestions: number;
  difficulty: DifficultyLevel;
  accuracy: number;
}

export interface PlagiarismResult {
  similarityScore: number;
  flaggedPassages: Array<{ text: string; sourceHint: string }>;
  analysis: string;
}

export interface AIDetectionResult {
  isAI: boolean;
  confidenceScore: number;
  reasoning: string[];
}

export interface SupervisorResult {
  detectedIssues: string[];
  suggestedImprovements: string[];
  structuralRecommendations: string[];
  overallFeedback: string;
}
