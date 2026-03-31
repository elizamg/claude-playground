export type Role = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type ReturnTypeName = 'int' | 'float' | 'str' | 'bool' | 'list' | 'dict' | 'None';

export interface TestCase {
  id: string;
  input: string;                   // e.g. "2, 3" — raw string passed to mock execution
  expectedReturnValue: string;     // stored as string; JSON.parse()d at evaluation time
  expectedReturnType: ReturnTypeName;
}

export interface Step {
  id: string;
  order: number;                   // 1-indexed
  prompt: string;
  starterCode: string;
  testCases: TestCase[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}

export interface MockExecutionResult {
  returnValue: unknown;
  returnType: ReturnTypeName;
  executionTimeMs: number;
}

export interface Submission {
  stepId: string;
  code: string;
  submittedAt: string;             // ISO timestamp
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;                 // returnValue match AND returnType match
  actualReturnValue: unknown;
  actualReturnType: ReturnTypeName;
  executionTimeMs: number;         // displayed only, not used for pass/fail
  feedback: string;
}

export interface StepResult {
  stepId: string;
  passed: boolean;                 // true only if ALL test cases pass
  testCaseResults: TestCaseResult[];
  aggregateFeedback: string;
}

export interface StudentProgress {
  lessonId: string;
  currentStepIndex: number;        // 0-indexed
  attempts: Record<string, Submission[]>;   // stepId → attempts
  results: Record<string, StepResult>;      // stepId → latest result
}

export interface HintRequest {
  step: Step;
  submission: Submission;
  stepResult: StepResult;
}

export type HintProvider = (req: HintRequest) => Promise<string>;
