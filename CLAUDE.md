# CLAUDE.md — AI-Assisted Lesson Runner

## Project Overview

This is a **mock-data, frontend-only prototype** of an interactive coding lesson platform for teachers and students. There is no real backend — all data lives in memory or module-level state. The app is built as a **React SPA** using Tailwind CSS for styling.

---

## Stack & Constraints

- **Framework**: React (functional components + hooks)
- **Styling**: Tailwind CSS utility classes only (no custom CSS files unless absolutely necessary)
- **State**: React state (`useState`, `useReducer`, `useContext`) — no Redux, no external store
- **No backend**: All lessons, users, submissions, and results are mock data defined in code
- **No real code execution**: Student code is pre-populated; evaluation is simulated/mocked
- **Language assumption**: Student code is always Python (display and validate as Python syntax)
- **No auth**: Login screen is purely cosmetic with auto-filled credentials

---

## App Structure

### Routes / Views

```
/                    → MockLoginScreen
/teacher             → TeacherView
/student             → StudentView
```

A top-level `AppShell` component reads the current "logged-in user" from state and renders the appropriate view. Navigation between views happens by updating state (no router required, but one may be added).

---

## Data Model

### User

```ts
type Role = "teacher" | "student";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
```

### Lesson

```ts
interface Lesson {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}
```

### Step

```ts
interface Step {
  id: string;
  order: number;            // 1-indexed display order
  prompt: string;           // instructional/question text shown to student
  starterCode: string;      // pre-populated Python code block
  testCases: TestCase[];
}
```

### TestCase

Test cases are the evaluation units for a step. Each test case has an input and expected outputs:

```ts
type ReturnTypeName = "int" | "float" | "str" | "bool" | "list" | "dict" | "None";

interface TestCase {
  id: string;
  input: string;                   // e.g. "2, 3" — passed to mock execution
  expectedReturnValue: string;     // stored as string; JSON.parse()d at evaluation time
  expectedReturnType: ReturnTypeName;
}
```

The teacher sets `input`, `expectedReturnValue`, and `expectedReturnType`. Execution time is computed by `mockExecute` and displayed to both teacher and student, but is **not** a pass/fail criterion.

### Submission & Result

```ts
interface Submission {
  stepId: string;
  code: string;
  submittedAt: string;             // ISO timestamp
}

interface TestCaseResult {
  testCaseId: string;
  passed: boolean;                 // returnValue match AND returnType match
  actualReturnValue: unknown;
  actualReturnType: string;
  executionTimeMs: number;         // displayed only, not used for pass/fail
  feedback: string;
}

interface StepResult {
  stepId: string;
  passed: boolean;                 // true if ALL test cases pass
  testCaseResults: TestCaseResult[];
  aggregateFeedback: string;       // summary string shown to student
}
```

### Student Progress

```ts
interface StudentProgress {
  lessonId: string;
  currentStepIndex: number;        // 0-indexed
  attempts: Record<string, Submission[]>;   // stepId → attempts
  results: Record<string, StepResult>;      // stepId → latest result
}
```

---

## Evaluation Flow (Mocked)

When a student submits code, `evaluateSubmission(step, code)` is called:

1. For each `TestCase`, call `mockExecute(code, input)` to get a `MockExecutionResult`
2. A test case **passes** if `actualReturnValue === expectedReturnValue && actualReturnType === expectedReturnType`
3. `executionTimeMs` is collected and surfaced in feedback, but does **not** affect pass/fail
4. A step **passes** only if **all test cases pass**
5. Combine all feedback strings into `aggregateFeedback`
6. Return a `StepResult`

### Mock Execution

```ts
interface MockExecutionResult {
  returnValue: unknown;
  returnType: string;
  executionTimeMs: number;
}

function mockExecute(code: string, input: string): MockExecutionResult
```

This function does **not** run real Python. It returns a deterministic stub (`returnValue: 5`, `returnType: "int"`, `executionTimeMs: 42`) regardless of input. The goal is to let the UI flow work end-to-end without a sandbox.

### Extensibility Hook — AI Hints

AI hint generation is **decoupled** from grading:

```ts
interface HintRequest {
  step: Step;
  submission: Submission;
  stepResult: StepResult;
}

type HintProvider = (req: HintRequest) => Promise<string>;
```

A `hintProvider` prop/context can be injected into the student view. A no-op stub is used in the prototype. Later, a real Claude API call can be swapped in without touching grading logic.

---

## Component Tree

```
AppShell
├── MockLoginScreen
├── TeacherView
│   └── QuestionEditorCard (×N, one per step)
│       ├── prompt textarea
│       ├── starterCode textarea (font-mono, labeled "Python")
│       └── TestCasesEditor
│           └── TestCaseRow (×N)
│               ├── input field
│               ├── expectedReturnValue field
│               ├── expectedReturnType dropdown
│               └── executionTimeMs display (read-only)
└── StudentView
    └── StepCard (one active step at a time)
        ├── PromptDisplay
        ├── CodeEditor (pre-populated, editable display)
        ├── RunButton
        └── FeedbackPanel
```

---

## MockLoginScreen

- Displays a centered login form
- **Auto-filled** email: `teacher@school.edu` / `student@school.edu` and a dummy password
- A **checkbox** labeled "I am an instructor" toggles the role
- Clicking **Enter** sets the user in app state and navigates to the correct view
- No real auth; no API call

---

## TeacherView

The teacher's primary workspace.

### Layout

- Full-width page with a heading showing the lesson title
- Steps rendered **vertically as a list**, one `QuestionEditorCard` per step
- A **"+ Add Step"** button at the bottom appends a new blank step
- Step ordering is shown with a numbered label (Step 1, Step 2, …)

### QuestionEditorCard

Each card is a self-contained editor for one step. It must include:

| Field | Component | Notes |
|---|---|---|
| `prompt` | Multiline textarea | Free text; the question or instruction shown to students |
| `starterCode` | Code textarea | Displayed with monospace font; labeled "Python"; no real linting |
| `testCases` | TestCasesEditor | See below |

#### TestCasesEditor

Displays a list of test cases and a **"+ Add Test Case"** button. Each test case row contains:

| Field | UI | Notes |
|---|---|---|
| `input` | Text input | e.g. `2, 3` — arguments passed to the function |
| `expectedReturnValue` | Text input | Stored as string; `JSON.parse()`d at evaluation time |
| `expectedReturnType` | Dropdown | `int`, `float`, `str`, `bool`, `list`, `dict`, `None` |
| `executionTimeMs` | Read-only display | From `mockExecute(starterCode, input)` — e.g. `42ms` |

Each row has a **remove (×)** button. Changes update the lesson state in memory.

---

## StudentView

- Displays **one step at a time** based on `currentStepIndex`
- Shows: step number, prompt, pre-populated (editable) code
- **Run** button triggers `evaluateSubmission` and displays `FeedbackPanel`
- If step passes: shows a success message + **"Next Step"** button
- If step fails: shows per-test-case feedback (return value mismatch, type mismatch); student may retry
- Execution time is displayed for each test case (informational only)
- Progress is tracked in `StudentProgress` state

---

## Mock Data

Define at least **one lesson** with **3 steps** in a `mockData.ts` file. Example structure:

```ts
export const MOCK_LESSON: Lesson = {
  id: "lesson-1",
  title: "Introduction to Functions",
  description: "Learn how to write and call Python functions.",
  steps: [
    {
      id: "step-1",
      order: 1,
      prompt: "Write a function `add(a, b)` that returns the sum of two numbers.",
      starterCode: "def add(a, b):\n    return a + b",
      testCases: [
        { id: "tc-1-1", input: "2, 3", expectedReturnValue: "5", expectedReturnType: "int" },
        { id: "tc-1-2", input: "10, 0", expectedReturnValue: "10", expectedReturnType: "int" },
      ]
    },
    // ... 2 more steps
  ]
};
```

---

## State Management Rules

- All app state lives in the top-level `AppShell` component and is passed down as props or via context
- `StudentProgress` is initialized fresh on login; not persisted
- Teacher edits to a lesson mutate a local copy of `MOCK_LESSON` (deep clone on load); not persisted
- No `localStorage`, no `sessionStorage`, no API calls (except future AI hint injection)

---

## Naming & File Conventions

```
src/
  components/
    MockLoginScreen.tsx
    TeacherView.tsx
    QuestionEditorCard.tsx
    TestCasesEditor.tsx
    StudentView.tsx
    StepCard.tsx
    FeedbackPanel.tsx
  engine/
    types.ts          ← all shared interfaces
    evaluate.ts       ← evaluateSubmission(), mockExecute()
    hints.ts          ← HintProvider stub
  data/
    mockData.ts       ← MOCK_LESSON and MOCK_USERS
  App.tsx             ← AppShell + routing logic
```

---

## Design & Aesthetic Direction

- Clean, professional, education-tool aesthetic (think Linear meets a classroom tool)
- Avoid generic purple-gradient AI aesthetics
- Use a monospace font for all code fields (`font-mono`)
- Teacher UI: slightly more information-dense; muted color palette with clear card hierarchy
- Student UI: more spacious; friendly, focused, one thing at a time
- Feedback: green for pass, red/amber for failure — use color purposefully, not decoratively

---

## Tradeoffs Already Decided

| Question | Decision |
|---|---|
| All test cases or threshold? | All test cases must pass |
| Feedback: stop at first fail or aggregate? | Aggregate all — show all failures at once |
| Execution time as pass/fail? | No — displayed only; not a criterion |
| Who sets expected values? | Teacher sets input, expectedReturnValue, expectedReturnType; execution time is computed/displayed |
| Attempt history? | Stored in memory per session; not displayed in V1 |
| AI hints sync or async? | Async (Promise-based) but stubbed for now |
| State: memory or storage? | In-memory only for this prototype |
| Real code execution? | Mocked — deterministic stub |

---

## Out of Scope for V1

- Real Python execution / sandboxing
- Persisted state / database
- Real authentication
- Multiple lessons in teacher UI
- Student-side hint UI (provider is wired but not surfaced)
- Drag-to-reorder steps
- Step deletion (add only in V1)