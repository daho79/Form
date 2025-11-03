
export enum QuestionType {
  TEXT = 'TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CHECKBOXES = 'CHECKBOXES',
  DROPDOWN = 'DROPDOWN',
}

export interface Option {
  id: string;
  value: string;
}

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  required: boolean;
  options: Option[];
}

export type ThemeName = 'indigo' | 'teal' | 'gray' | 'orange';

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  theme: ThemeName;
  headerImage?: string | null;
}

export type Answer = string | string[];

export interface Submission {
  id: string;
  submittedAt: string;
  answers: Record<string, Answer>; 
}