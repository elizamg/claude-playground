# Teacher Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a functional teacher lesson editor (MockLoginScreen + TeacherView) on top of a fresh Vite + React 19 project, migrated to TypeScript with Tailwind CSS.

**Architecture:** `AppShell` (App.tsx) owns all state and conditionally renders `MockLoginScreen`, `TeacherView`, or `StudentView` based on the current user. The teacher can edit a deep-cloned copy of `MOCK_LESSON` — changes flow up through `onLessonChange` prop callbacks. Evaluation logic lives in `engine/evaluate.ts` as pure functions.

**Tech Stack:** React 19, Vite 8, TypeScript (strict), Tailwind CSS v4 (`@tailwindcss/vite`), Vitest

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `tsconfig.json` | Create | TypeScript compiler config |
| `tsconfig.node.json` | Create | TS config for vite.config.ts |
| `vite.config.ts` | Replace `vite.config.js` | Vite config with React + Tailwind + Vitest |
| `src/vite-env.d.ts` | Create | Vite client type reference |
| `src/index.css` | Modify | Tailwind import only |
| `src/main.tsx` | Replace `main.jsx` | React root mount |
| `src/App.tsx` | Replace `App.jsx` | AppShell — owns user/lesson state, routes views |
| `src/App.css` | Delete | Replaced by Tailwind |
| `src/engine/types.ts` | Create | All shared TypeScript interfaces |
| `src/engine/evaluate.ts` | Create | `mockExecute()` + `evaluateSubmission()` |
| `src/engine/evaluate.test.ts` | Create | Vitest unit tests for evaluation engine |
| `src/engine/hints.ts` | Create | No-op `hintProvider` stub |
| `src/data/mockData.ts` | Create | `MOCK_LESSON` (3 steps) + `MOCK_USERS` |
| `src/components/MockLoginScreen.tsx` | Create | Login form with role toggle |
| `src/components/TeacherView.tsx` | Create | Lesson editor — list of steps + Add Step |
| `src/components/QuestionEditorCard.tsx` | Create | Single step editor (prompt + code + test cases) |
| `src/components/TestCasesEditor.tsx` | Create | Test case list with add/remove/edit |
| `src/components/StudentView.tsx` | Create | Blank placeholder |

---

## Task 1: Migrate to TypeScript + Install Tailwind

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/vite-env.d.ts`
- Replace: `vite.config.js` → `vite.config.ts`
- Modify: `src/index.css`
- Replace: `src/main.jsx` → `src/main.tsx`
- Replace: `src/App.jsx` → `src/App.tsx`
- Delete: `src/App.css`

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/elizamg/Desktop/claude_playground
npm install -D typescript tailwindcss @tailwindcss/vite vitest
```

Expected: packages added to `node_modules`, `package-lock.json` updated.

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add `"test": "vitest run"` to the `"scripts"` block:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Replace `vite.config.js` with `vite.config.ts`**

Delete `vite.config.js` and create `vite.config.ts`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 6: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 7: Replace `src/index.css`**

Remove all existing content and replace with:

```css
@import "tailwindcss";
```

- [ ] **Step 8: Replace `src/main.jsx` with `src/main.tsx`**

Delete `src/main.jsx` and create `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: Replace `src/App.jsx` with a minimal `src/App.tsx`**

Delete `src/App.jsx` and `src/App.css`, then create `src/App.tsx`:

```tsx
export default function App() {
  return <div className="min-h-screen bg-gray-50" />
}
```

- [ ] **Step 10: Verify the dev server runs**

```bash
npm run dev
```

Expected: Vite starts on `http://localhost:5173`, no errors in terminal. The browser shows a gray background (Tailwind `bg-gray-50` applied). No TypeScript errors.

- [ ] **Step 11: Commit**

```bash
git init
git add tsconfig.json tsconfig.node.json vite.config.ts src/vite-env.d.ts src/index.css src/main.tsx src/App.tsx package.json package-lock.json
git commit -m "chore: migrate to TypeScript + add Tailwind CSS v4 + Vitest"
```

---

## Task 2: Define Shared Types

**Files:**
- Create: `src/engine/types.ts`

- [ ] **Step 1: Create `src/engine/types.ts`**

```ts
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
  returnType: string;
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
  actualReturnType: string;
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
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Mock Data

**Files:**
- Create: `src/data/mockData.ts`

- [ ] **Step 1: Create `src/data/mockData.ts`**

```ts
import type { Lesson, User } from '../engine/types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-teacher',
    name: 'Ms. Smith',
    email: 'teacher@school.edu',
    role: 'teacher',
  },
  {
    id: 'user-student',
    name: 'Alex Johnson',
    email: 'student@school.edu',
    role: 'student',
  },
];

export const MOCK_LESSON: Lesson = {
  id: 'lesson-1',
  title: 'Introduction to Functions',
  description: 'Learn how to write and call Python functions.',
  steps: [
    {
      id: 'step-1',
      order: 1,
      prompt: 'Write a function `add(a, b)` that returns the sum of two numbers.',
      starterCode: 'def add(a, b):\n    return a + b',
      testCases: [
        { id: 'tc-1-1', input: '2, 3', expectedReturnValue: '5', expectedReturnType: 'int' },
        { id: 'tc-1-2', input: '10, 0', expectedReturnValue: '10', expectedReturnType: 'int' },
        { id: 'tc-1-3', input: '-1, 1', expectedReturnValue: '0', expectedReturnType: 'int' },
      ],
    },
    {
      id: 'step-2',
      order: 2,
      prompt: 'Write a function `greet(name)` that returns the string "Hello, {name}!".',
      starterCode: 'def greet(name):\n    return f"Hello, {name}!"',
      testCases: [
        { id: 'tc-2-1', input: '"Alice"', expectedReturnValue: '"Hello, Alice!"', expectedReturnType: 'str' },
        { id: 'tc-2-2', input: '"Bob"', expectedReturnValue: '"Hello, Bob!"', expectedReturnType: 'str' },
      ],
    },
    {
      id: 'step-3',
      order: 3,
      prompt: 'Write a function `is_even(n)` that returns True if n is even, False otherwise.',
      starterCode: 'def is_even(n):\n    return n % 2 == 0',
      testCases: [
        { id: 'tc-3-1', input: '4', expectedReturnValue: 'true', expectedReturnType: 'bool' },
        { id: 'tc-3-2', input: '3', expectedReturnValue: 'false', expectedReturnType: 'bool' },
        { id: 'tc-3-3', input: '0', expectedReturnValue: 'true', expectedReturnType: 'bool' },
      ],
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/data/mockData.ts
git commit -m "feat: add mock lesson data and users"
```

---

## Task 4: Evaluation Engine (TDD)

**Files:**
- Create: `src/engine/evaluate.ts`
- Create: `src/engine/evaluate.test.ts`

- [ ] **Step 1: Write the failing tests in `src/engine/evaluate.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { mockExecute, evaluateSubmission } from './evaluate';
import type { Step } from './types';

describe('mockExecute', () => {
  it('returns a fixed stub regardless of code or input', () => {
    const result = mockExecute('def foo(): return 1', '1, 2');
    expect(result).toEqual({ returnValue: 5, returnType: 'int', executionTimeMs: 42 });
  });

  it('returns the same result for different inputs', () => {
    expect(mockExecute('', 'anything')).toEqual(mockExecute('other code', 'other input'));
  });
});

describe('evaluateSubmission', () => {
  const passingStep: Step = {
    id: 'step-1',
    order: 1,
    prompt: 'test',
    starterCode: '',
    testCases: [
      // mock always returns returnValue=5, returnType='int' — this matches
      { id: 'tc-1', input: '2, 3', expectedReturnValue: '5', expectedReturnType: 'int' },
    ],
  };

  const failingStep: Step = {
    id: 'step-2',
    order: 2,
    prompt: 'test',
    starterCode: '',
    testCases: [
      // mock returns returnValue=5, but expected is 0 — should fail
      { id: 'tc-1', input: '0, 0', expectedReturnValue: '0', expectedReturnType: 'int' },
    ],
  };

  const mixedStep: Step = {
    id: 'step-3',
    order: 3,
    prompt: 'test',
    starterCode: '',
    testCases: [
      { id: 'tc-1', input: '2, 3', expectedReturnValue: '5', expectedReturnType: 'int' }, // pass
      { id: 'tc-2', input: '0, 0', expectedReturnValue: '0', expectedReturnType: 'int' }, // fail
    ],
  };

  it('passes when mock output matches expected value and type', () => {
    const result = evaluateSubmission(passingStep, '');
    expect(result.passed).toBe(true);
    expect(result.testCaseResults[0].passed).toBe(true);
  });

  it('fails when expected value does not match mock output', () => {
    const result = evaluateSubmission(failingStep, '');
    expect(result.passed).toBe(false);
    expect(result.testCaseResults[0].passed).toBe(false);
  });

  it('step fails if ANY test case fails', () => {
    const result = evaluateSubmission(mixedStep, '');
    expect(result.passed).toBe(false);
    expect(result.testCaseResults[0].passed).toBe(true);
    expect(result.testCaseResults[1].passed).toBe(false);
  });

  it('produces aggregateFeedback with one line per test case', () => {
    const result = evaluateSubmission(mixedStep, '');
    expect(result.aggregateFeedback).toContain('Test 1:');
    expect(result.aggregateFeedback).toContain('Test 2:');
  });

  it('includes executionTimeMs in each test case result', () => {
    const result = evaluateSubmission(passingStep, '');
    expect(result.testCaseResults[0].executionTimeMs).toBe(42);
  });

  it('fails when return type does not match', () => {
    const wrongTypeStep: Step = {
      ...passingStep,
      testCases: [
        { id: 'tc-1', input: '2, 3', expectedReturnValue: '5', expectedReturnType: 'str' },
      ],
    };
    const result = evaluateSubmission(wrongTypeStep, '');
    expect(result.passed).toBe(false);
  });

  it('parses expectedReturnValue as JSON (e.g. boolean true)', () => {
    const boolStep: Step = {
      ...passingStep,
      testCases: [
        // mock returns returnValue=5 (number), not true (boolean) — should fail
        { id: 'tc-1', input: '4', expectedReturnValue: 'true', expectedReturnType: 'bool' },
      ],
    };
    const result = evaluateSubmission(boolStep, '');
    // 5 !== true
    expect(result.passed).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './evaluate'`

- [ ] **Step 3: Create `src/engine/evaluate.ts`**

```ts
import type { MockExecutionResult, Step, StepResult, TestCaseResult } from './types';

export function mockExecute(_code: string, _input: string): MockExecutionResult {
  return {
    returnValue: 5,
    returnType: 'int',
    executionTimeMs: 42,
  };
}

export function evaluateSubmission(step: Step, code: string): StepResult {
  const testCaseResults: TestCaseResult[] = step.testCases.map((tc, i) => {
    const execution = mockExecute(code, tc.input);

    let parsedExpected: unknown;
    try {
      parsedExpected = JSON.parse(tc.expectedReturnValue);
    } catch {
      parsedExpected = tc.expectedReturnValue;
    }

    const returnValuePassed = execution.returnValue === parsedExpected;
    const returnTypePassed = execution.returnType === tc.expectedReturnType;
    const passed = returnValuePassed && returnTypePassed;

    const failureReasons: string[] = [];
    if (!returnValuePassed) {
      failureReasons.push(
        `expected return value ${tc.expectedReturnValue}, got ${String(execution.returnValue)}`
      );
    }
    if (!returnTypePassed) {
      failureReasons.push(
        `expected type ${tc.expectedReturnType}, got ${execution.returnType}`
      );
    }

    const feedback = passed
      ? `Test ${i + 1} passed`
      : `Test ${i + 1} failed: ${failureReasons.join('; ')}`;

    return {
      testCaseId: tc.id,
      passed,
      actualReturnValue: execution.returnValue,
      actualReturnType: execution.returnType,
      executionTimeMs: execution.executionTimeMs,
      feedback,
    };
  });

  const passed = testCaseResults.every((r) => r.passed);
  const aggregateFeedback = testCaseResults.map((r) => r.feedback).join('\n');

  return {
    stepId: step.id,
    passed,
    testCaseResults,
    aggregateFeedback,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/evaluate.ts src/engine/evaluate.test.ts
git commit -m "feat: add mock evaluation engine with tests"
```

---

## Task 5: Hints Stub

**Files:**
- Create: `src/engine/hints.ts`

- [ ] **Step 1: Create `src/engine/hints.ts`**

```ts
import type { HintProvider } from './types';

export const hintProvider: HintProvider = (_req) => Promise.resolve('');
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/hints.ts
git commit -m "feat: add no-op hint provider stub"
```

---

## Task 6: AppShell

**Files:**
- Replace: `src/App.tsx` (current placeholder → full AppShell)

- [ ] **Step 1: Replace `src/App.tsx` with the full AppShell**

```tsx
import { useState } from 'react';
import type { Lesson, User } from './engine/types';
import { MOCK_LESSON, MOCK_USERS } from './data/mockData';
import MockLoginScreen from './components/MockLoginScreen';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lesson, setLesson] = useState<Lesson>(deepClone(MOCK_LESSON));

  const handleLogin = (user: User) => {
    if (user.role === 'teacher') {
      setLesson(deepClone(MOCK_LESSON));
    }
    setCurrentUser(user);
  };

  if (!currentUser) {
    return <MockLoginScreen onLogin={handleLogin} />;
  }

  if (currentUser.role === 'teacher') {
    return <TeacherView lesson={lesson} onLessonChange={setLesson} />;
  }

  return <StudentView />;
}
```

Note: `studentProgress` is intentionally omitted here — it will be added in the StudentView implementation task to avoid unused-variable lint errors.

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add AppShell with user state and view routing"
```

---

## Task 7: MockLoginScreen

**Files:**
- Create: `src/components/MockLoginScreen.tsx`

- [ ] **Step 1: Create `src/components/MockLoginScreen.tsx`**

```tsx
import { useState } from 'react';
import type { User } from '../engine/types';
import { MOCK_USERS } from '../data/mockData';

interface Props {
  onLogin: (user: User) => void;
}

export default function MockLoginScreen({ onLogin }: Props) {
  const [isInstructor, setIsInstructor] = useState(false);

  const email = isInstructor ? 'teacher@school.edu' : 'student@school.edu';
  const user = MOCK_USERS.find((u) => u.email === email)!;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Sign in</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value="password"
              readOnly
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="instructor-toggle"
              type="checkbox"
              checked={isInstructor}
              onChange={(e) => setIsInstructor(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="instructor-toggle" className="text-sm text-gray-700">
              I am an instructor
            </label>
          </div>
          <button
            onClick={() => onLogin(user)}
            className="w-full bg-gray-900 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Start dev server and verify login screen renders**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected: centered white card on gray background with email, password, checkbox, Enter button. Toggling the checkbox changes the email. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/MockLoginScreen.tsx
git commit -m "feat: add MockLoginScreen with role toggle"
```

---

## Task 8: StudentView Placeholder

**Files:**
- Create: `src/components/StudentView.tsx`

- [ ] **Step 1: Create `src/components/StudentView.tsx`**

```tsx
export default function StudentView() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Student view coming soon.</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify student login flow**

With dev server running, uncheck "I am an instructor" and click Enter. Expected: "Student view coming soon." centered on gray page.

- [ ] **Step 3: Commit**

```bash
git add src/components/StudentView.tsx
git commit -m "feat: add StudentView placeholder"
```

---

## Task 9: TestCasesEditor

**Files:**
- Create: `src/components/TestCasesEditor.tsx`

- [ ] **Step 1: Create `src/components/TestCasesEditor.tsx`**

```tsx
import { useId } from 'react';
import type { TestCase, ReturnTypeName } from '../engine/types';
import { mockExecute } from '../engine/evaluate';

interface Props {
  testCases: TestCase[];
  onChange: (testCases: TestCase[]) => void;
  starterCode: string;
}

const RETURN_TYPES: ReturnTypeName[] = ['int', 'float', 'str', 'bool', 'list', 'dict', 'None'];

export default function TestCasesEditor({ testCases, onChange, starterCode }: Props) {
  const baseId = useId();

  const addTestCase = () => {
    const newCase: TestCase = {
      id: `tc-${Date.now()}`,
      input: '',
      expectedReturnValue: '',
      expectedReturnType: 'int',
    };
    onChange([...testCases, newCase]);
  };

  const updateTestCase = (index: number, updates: Partial<TestCase>) => {
    onChange(testCases.map((tc, i) => (i === index ? { ...tc, ...updates } : tc)));
  };

  const removeTestCase = (index: number) => {
    onChange(testCases.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Test Cases
      </div>
      {testCases.length === 0 && (
        <p className="text-sm text-gray-400 italic">No test cases yet.</p>
      )}
      {testCases.map((tc, i) => {
        const execResult = mockExecute(starterCode, tc.input);
        return (
          <div
            key={tc.id}
            className="bg-gray-50 border border-gray-200 rounded-md p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Test {i + 1}</span>
              <button
                onClick={() => removeTestCase(i)}
                className="text-gray-400 hover:text-red-500 text-base leading-none cursor-pointer"
                aria-label="Remove test case"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label
                  htmlFor={`${baseId}-input-${i}`}
                  className="block text-xs text-gray-500 mb-1"
                >
                  Input
                </label>
                <input
                  id={`${baseId}-input-${i}`}
                  type="text"
                  value={tc.input}
                  onChange={(e) => updateTestCase(i, { input: e.target.value })}
                  placeholder="e.g. 2, 3"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                />
              </div>
              <div>
                <label
                  htmlFor={`${baseId}-retval-${i}`}
                  className="block text-xs text-gray-500 mb-1"
                >
                  Expected value
                </label>
                <input
                  id={`${baseId}-retval-${i}`}
                  type="text"
                  value={tc.expectedReturnValue}
                  onChange={(e) => updateTestCase(i, { expectedReturnValue: e.target.value })}
                  placeholder="e.g. 5"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                />
              </div>
              <div>
                <label
                  htmlFor={`${baseId}-rettype-${i}`}
                  className="block text-xs text-gray-500 mb-1"
                >
                  Expected type
                </label>
                <select
                  id={`${baseId}-rettype-${i}`}
                  value={tc.expectedReturnType}
                  onChange={(e) =>
                    updateTestCase(i, {
                      expectedReturnType: e.target.value as ReturnTypeName,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {RETURN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Execution time (mock):{' '}
              <span className="font-mono">{execResult.executionTimeMs}ms</span>
            </div>
          </div>
        );
      })}
      <button
        onClick={addTestCase}
        className="text-sm text-gray-500 hover:text-gray-800 border border-dashed border-gray-300 rounded-md px-3 py-1.5 w-full hover:border-gray-400 transition-colors cursor-pointer"
      >
        + Add Test Case
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TestCasesEditor.tsx
git commit -m "feat: add TestCasesEditor component"
```

---

## Task 10: QuestionEditorCard

**Files:**
- Create: `src/components/QuestionEditorCard.tsx`

- [ ] **Step 1: Create `src/components/QuestionEditorCard.tsx`**

```tsx
import type { Step } from '../engine/types';
import TestCasesEditor from './TestCasesEditor';

interface Props {
  step: Step;
  onChange: (step: Step) => void;
}

export default function QuestionEditorCard({ step, onChange }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Step {step.order}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prompt
        </label>
        <textarea
          value={step.prompt}
          onChange={(e) => onChange({ ...step, prompt: e.target.value })}
          rows={3}
          placeholder="Question or instruction shown to students"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Starter Code{' '}
          <span className="text-gray-400 font-normal text-xs">(Python)</span>
        </label>
        <textarea
          value={step.starterCode}
          onChange={(e) => onChange({ ...step, starterCode: e.target.value })}
          rows={5}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono resize-y"
          spellCheck={false}
        />
      </div>
      <TestCasesEditor
        testCases={step.testCases}
        onChange={(testCases) => onChange({ ...step, testCases })}
        starterCode={step.starterCode}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/QuestionEditorCard.tsx
git commit -m "feat: add QuestionEditorCard component"
```

---

## Task 11: TeacherView + End-to-End Verification

**Files:**
- Create: `src/components/TeacherView.tsx`

- [ ] **Step 1: Create `src/components/TeacherView.tsx`**

```tsx
import type { Lesson, Step } from '../engine/types';
import QuestionEditorCard from './QuestionEditorCard';

interface Props {
  lesson: Lesson;
  onLessonChange: (lesson: Lesson) => void;
}

export default function TeacherView({ lesson, onLessonChange }: Props) {
  const updateStep = (updatedStep: Step) => {
    onLessonChange({
      ...lesson,
      steps: lesson.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
    });
  };

  const addStep = () => {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      order: lesson.steps.length + 1,
      prompt: '',
      starterCode: '',
      testCases: [],
    };
    onLessonChange({ ...lesson, steps: [...lesson.steps, newStep] });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{lesson.title}</h1>
        <div className="space-y-6">
          {lesson.steps.map((step) => (
            <QuestionEditorCard key={step.id} step={step} onChange={updateStep} />
          ))}
        </div>
        <button
          onClick={addStep}
          className="mt-6 w-full text-sm text-gray-500 hover:text-gray-800 border border-dashed border-gray-300 rounded-lg px-4 py-3 hover:border-gray-400 transition-colors cursor-pointer"
        >
          + Add Step
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run end-to-end verification in the browser**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:
1. Login screen shows centered card — check "I am an instructor", click Enter
2. TeacherView loads — shows "Introduction to Functions" heading
3. Three `QuestionEditorCard` cards are visible, each with prompt, starter code, and test cases
4. Each test case shows input, expected value, type dropdown, and `42ms` execution time
5. Edit a prompt — value updates in real time
6. Click "+ Add Test Case" — a new blank row appears with "×" button
7. Click "×" — row is removed
8. Click "+ Add Step" — a new blank Step 4 card appears

- [ ] **Step 3: Run tests one final time**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/TeacherView.tsx
git commit -m "feat: add TeacherView — teacher interface complete"
```
