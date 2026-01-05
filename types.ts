export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'Todo' | 'Attempted' | 'Solved';
export type Efficiency = 'Elite' | 'High' | 'Avg' | 'Low' | '-';

export interface Solution {
  id: string;
  title: string;
  code: string;
  language: string;
  complexity?: string;
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface Question {
  id: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  status: Status;
  topics: string[];
  description: string;
  notes: string;
  hints: string[];
  solutions: Solution[];
  testCases?: TestCase[]; // Added field
  timeTaken: number; // in seconds
  lastAttempted: string | null; // ISO date
  mistakes: string;
  nextReviewDate?: string | null; // ISO date
  reviewInterval?: number; // days
}

export interface AppState {
  questions: Question[];
  view: 'dashboard' | 'todo' | 'analytics';
  weeklyGoal: number; // number of problems
  apiKey: string;
}

export const DIFFICULTY_TIME_STANDARD = {
  Easy: 10 * 60, // 10 mins
  Medium: 25 * 60, // 25 mins
  Hard: 45 * 60, // 45 mins
};

export interface Example {
  id: string;
  inputText: string;
  outputText: string;
  explanation?: string;
  args: any[];
  expected: any;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  defaultCode: string;
  functionName: string;
  examples: Example[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ComplexityData {
  n: number;
  steps: number;
}

export interface TestResult {
  passed: boolean;
  input: string;
  expected?: string;
  actual?: string;
  error?: string;
}