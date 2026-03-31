# Teacher Interface Design
**Date:** 2026-03-30
**Scope:** MockLoginScreen + AppShell + TeacherView (StudentView is a blank placeholder)

---

## Stack & Setup

- **Framework:** React 19 + Vite (existing project)
- **Language:** TypeScript — rename `App.jsx` → `App.tsx`, `main.jsx` → `main.tsx`, delete `App.css`
- **Styling:** Tailwind CSS — install `tailwindcss` + `@tailwindcss/vite`, update `vite.config.ts`, replace `index.css` with `@import "tailwindcss"`
- **State:** `useState` in `AppShell`, passed down as props — no context, no external store
- **No backend, no auth, no persistence**

---

## File Structure

```
src/
  components/
    MockLoginScreen.tsx
    TeacherView.tsx
    QuestionEditorCard.tsx
    TestCasesEditor.tsx
    StudentView.tsx        ← blank placeholder
  engine/
    types.ts
    evaluate.ts
    hints.ts
  data/
    mockData.ts
  App.tsx                  ← AppShell
  main.tsx
```

---

## Data Model (`engine/types.ts`)

```ts
type Role = "teacher" | "student";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface TestCase {
  id: string;
  input: string;                  // e.g. "2, 3"
  expectedReturnValue: string;    // stored as raw string; JSON.parse()d at evaluation time
  expectedReturnType: "int" | "float" | "str" | "bool" | "list" | "dict" | "None";
}

interface Step {
  id: string;
  order: number;         // 1-indexed
  prompt: string;
  starterCode: string;
  testCases: TestCase[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}

interface MockExecutionResult {
  returnValue: unknown;
  returnType: string;
  executionTimeMs: number;
}

interface Submission {
  stepId: string;
  code: string;
  submittedAt: string;   // ISO timestamp
}

interface TestCaseResult {
  testCaseId: string;
  passed: boolean;       // returnValue match AND returnType match
  actualReturnValue: unknown;
  actualReturnType: string;
  executionTimeMs: number;  // displayed, not used for pass/fail
  feedback: string;
}

interface StepResult {
  stepId: string;
  passed: boolean;           // true if ALL test cases pass
  testCaseResults: TestCaseResult[];
  aggregateFeedback: string;
}

interface StudentProgress {
  lessonId: string;
  currentStepIndex: number;
  attempts: Record<string, Submission[]>;
  results: Record<string, StepResult>;
}

interface HintRequest {
  step: Step;
  submission: Submission;
  stepResult: StepResult;
}

type HintProvider = (req: HintRequest) => Promise<string>;
```

---

## Mock Data (`data/mockData.ts`)

- `MOCK_USERS`: two users — `{ role: "teacher", email: "teacher@school.edu" }` and `{ role: "student", email: "student@school.edu" }`
- `MOCK_LESSON`: one lesson, "Introduction to Functions", 3 steps, each with 2–3 test cases covering a range of inputs

---

## Evaluation Engine (`engine/evaluate.ts`)

```ts
function mockExecute(code: string, input: string): MockExecutionResult
```
Returns a deterministic stub regardless of actual input (e.g. `returnValue: 5`, `returnType: "int"`, `executionTimeMs: 42`). Does not run real Python.

```ts
function evaluateSubmission(step: Step, code: string): StepResult
```
For each `TestCase`, calls `mockExecute`, then:
- `passed = actualReturnValue === expectedReturnValue && actualReturnType === expectedReturnType`
- Collects `executionTimeMs` for display only
- Step passes only if all test cases pass

---

## Hints Stub (`engine/hints.ts`)

```ts
const hintProvider: HintProvider = (_req) => Promise.resolve("");
```

No-op. Wired but not surfaced in V1.

---

## AppShell (`App.tsx`)

Owns all top-level state:
- `currentUser: User | null` — null renders `MockLoginScreen`
- `lesson: Lesson` — deep clone of `MOCK_LESSON`, initialized on teacher login
- `studentProgress: StudentProgress` — initialized fresh on student login

Conditional render:
```
currentUser === null        → MockLoginScreen
currentUser.role === "teacher" → TeacherView
currentUser.role === "student" → StudentView
```

No router required.

---

## MockLoginScreen

- Centered card layout
- Email auto-filled: `teacher@school.edu` or `student@school.edu`
- Password auto-filled: dummy value (cosmetic)
- Checkbox "I am an instructor" toggles email and role
- "Enter" button calls `onLogin(user: User)` with matching user from `MOCK_USERS`
- No API call, no validation

---

## TeacherView

**Props:** `lesson: Lesson`, `onLessonChange: (lesson: Lesson) => void`

**Layout:**
- Full-width page, lesson title as heading
- Vertical list of `QuestionEditorCard`, one per step, labeled "Step 1", "Step 2", …
- "+ Add Step" button at bottom appends a blank step (new `id`, incremented `order`, empty fields)

---

## QuestionEditorCard

**Props:** `step: Step`, `onChange: (step: Step) => void`

| Field | Component | Notes |
|---|---|---|
| Step label | Heading | "Step N", read-only |
| `prompt` | `<textarea>` | Free text |
| `starterCode` | `<textarea>` | `font-mono`, labeled "Python" |
| `testCases` | `TestCasesEditor` | See below |

---

## TestCasesEditor

**Props:** `testCases: TestCase[]`, `onChange: (testCases: TestCase[]) => void`, `starterCode: string`

Each test case row renders:

| Field | UI |
|---|---|
| Input | Text input — e.g. `2, 3` |
| Expected return value | Text input — stored as string, parsed via `JSON.parse()` at evaluation time (falls back to raw string on parse failure) |
| Expected return type | Dropdown: `int`, `float`, `str`, `bool`, `list`, `dict`, `None` |
| Execution time | Read-only — result of `mockExecute(starterCode, input).executionTimeMs`, shown as e.g. `42ms` |
| Remove | "×" button |

"+ Add Test Case" button appends a blank row with default type `"int"`.

All edits produce new objects (no mutation) and bubble up via `onChange`.

---

## StudentView (Placeholder)

```tsx
export default function StudentView() {
  return <div>Student view coming soon.</div>;
}
```

---

## Visual Style

- **Palette:** neutral grays, white cards on `bg-gray-50` page. No purple gradients.
- **Cards:** white background, subtle border and shadow, clear hierarchy
- **Code fields:** `font-mono` on all code textareas
- **Teacher UI:** information-dense, compact, muted
- **Login:** centered card, clean form
- **Feedback (future):** `text-green-600`/`bg-green-50` for pass; red/amber for fail — used only to convey status

---

## Out of Scope (V1)

- StudentView implementation
- Real Python execution
- AI hint UI
- Multiple lessons
- Step deletion or reordering
- Persisted state
