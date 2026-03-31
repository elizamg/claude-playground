# Student Interface Design
**Date:** 2026-03-30
**Scope:** StudentView + StepCarousel + StepCard + FeedbackPanel

---

## Context

`TeacherView`, `AppShell`, `MockLoginScreen`, and the full data model in `engine/types.ts`, evaluation engine in `engine/evaluate.ts`, and mock data in `data/mockData.ts` are already implemented per the teacher interface design spec. This spec implements the student-facing UI only. Do not modify any existing files except to import from them.

---

## Files to Create

```
src/
  components/
    StudentView.tsx
    StepCarousel.tsx
    StepCard.tsx
    FeedbackPanel.tsx
```

---

## Data Model Reference

These types are already defined in `engine/types.ts`. Do not redefine them.

```ts
interface TestCase {
  id: string;
  input: string;
  expectedReturnValue: string;     // stored as string, JSON.parse()d at evaluation time
  expectedReturnType: "int" | "float" | "str" | "bool" | "list" | "dict" | "None";
}

interface Step {
  id: string;
  order: number;
  prompt: string;
  starterCode: string;
  testCases: TestCase[];
}

interface TestCaseResult {
  testCaseId: string;
  passed: boolean;                 // returnValue match AND returnType match
  actualReturnValue: unknown;
  actualReturnType: string;
  executionTimeMs: number;         // display only — not used for pass/fail
  feedback: string;
}

interface StepResult {
  stepId: string;
  passed: boolean;                 // true if ALL test cases pass
  testCaseResults: TestCaseResult[];
  aggregateFeedback: string;
}

interface Submission {
  stepId: string;
  code: string;
  submittedAt: string;             // ISO timestamp
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

The evaluation function signature (from `engine/evaluate.ts`):

```ts
function evaluateSubmission(step: Step, code: string): StepResult
```

---

## StudentView

**Props:**
```ts
interface StudentViewProps {
  lesson: Lesson;
  studentProgress: StudentProgress;
  onProgressChange: (progress: StudentProgress) => void;
  hintProvider?: HintProvider;
}
```

`StudentView` is a thin wrapper that renders `<StepCarousel>` with the full step array and progress state. It handles the carousel's `onNext` event by updating `studentProgress.currentStepIndex` and bubbling up via `onProgressChange`.

Layout: full-width page, lesson title as a heading at the top, then the carousel below.

---

## StepCarousel

```ts
interface StepCarouselProps {
  steps: Step[];
  currentIndex: number;
  onNext: () => void;
  studentProgress: StudentProgress;
  onProgressChange: (progress: StudentProgress) => void;
  hintProvider?: HintProvider;
}
```

Renders all `StepCard` components in a horizontal strip inside an `overflow-hidden` container. Uses `transform: translateX(-${currentIndex * 100}%)` to slide the active card into view. Each card is `min-w-full`.

`onNext` is passed down from `StudentView` — `StepCarousel` does not manage `currentIndex` itself; it receives it as a prop. Advance is blocked at the last step (no wrap-around).

---

## StepCard

```ts
interface StepCardProps {
  step: Step;
  onNext: () => void;
  savedResult: StepResult | null;          // from studentProgress.results[step.id]
  onSubmit: (submission: Submission, result: StepResult) => void;
  hintProvider?: HintProvider;
}
```

Manages two pieces of local state:
- `code: string` — initialized from `step.starterCode`
- `result: StepResult | null` — initialized from `savedResult` prop (so a previously passed step shows its result on re-render)

Three sections stacked vertically:

**1. Prompt** — `step.prompt` as plain read-only text.

**2. Code area** — `<textarea>` pre-filled with `step.starterCode`. `font-mono`. Static `"Python"` badge in the top-right corner of the textarea wrapper. When the student edits, update local `code` state and clear `result` to `null` (so the feedback panel hides).

**3. Run button + FeedbackPanel** — a **Run** button is always visible below the code area. When clicked:
1. Call `evaluateSubmission(step, code)` to produce a `StepResult`
2. Build a `Submission` object: `{ stepId: step.id, code, submittedAt: new Date().toISOString() }`
3. Store `StepResult` in local `result` state
4. Call `onSubmit(submission, result)` so `AppShell` can update `studentProgress`

The Run button label stays `"Run"` at all times. Once `result` is non-null, render `<FeedbackPanel>`.

---

## FeedbackPanel

```ts
interface FeedbackPanelProps {
  result: StepResult;
  onNext: () => void;
}
```

Renders:

- One row per `TestCaseResult` in `result.testCaseResults`:
  - The `feedback` string
  - Execution time: `{executionTimeMs}ms` (display only)
  - A ✓ icon (`text-green-600`) if `passed: true`, a ✗ icon (`text-red-500`) if `passed: false`
- A summary line below all rows:
  - If `result.passed`: `"All test cases passed"` in `text-green-600`
  - If not: `"X of Y test cases failed"` in `text-amber-600`, where X = failed count, Y = total count
- If `result.passed`: render a **Next →** button that calls `onNext`
- If not: render nothing extra — student returns to the code area

---

## Progress Update Flow

`AppShell` owns `studentProgress`. When `StepCard.onSubmit` fires, `StudentView` updates progress and calls `onProgressChange`:

```ts
// On each submission
const updatedProgress: StudentProgress = {
  ...studentProgress,
  attempts: {
    ...studentProgress.attempts,
    [submission.stepId]: [
      ...(studentProgress.attempts[submission.stepId] ?? []),
      submission,
    ],
  },
  results: {
    ...studentProgress.results,
    [result.stepId]: result,          // last result per step wins
  },
};
onProgressChange(updatedProgress);
```

When `onNext` fires (student advances), `StudentView` increments `currentStepIndex`:

```ts
onProgressChange({
  ...studentProgress,
  currentStepIndex: studentProgress.currentStepIndex + 1,
});
```

---

## Mock Data Requirement

`data/mockData.ts` must include at least one step whose `starterCode` produces a **mixed result** when run through `evaluateSubmission` — some test cases pass, some fail. The simplest approach: a step with two test cases where `mockExecute` always returns `{ returnValue: 5, returnType: "int", executionTimeMs: 42 }`. Define one test case expecting `expectedReturnValue: "5"` and `expectedReturnType: "int"` (passes) and another expecting `expectedReturnValue: "10"` (fails). This exercises the failure branch of `FeedbackPanel` without any user interaction.

---

## Visual Style

Consistent with the teacher interface design spec:

- **Page background:** `bg-gray-50`
- **Cards:** white background, `rounded-lg`, subtle `shadow-sm` and `border border-gray-200`
- **Student UI:** more spacious than the teacher UI; one focused thing at a time
- **Code textarea:** `font-mono`, `bg-gray-900 text-gray-100` (dark code block), `text-sm`
- **Python badge:** small `text-xs` label, `bg-blue-100 text-blue-700`, positioned top-right of the code wrapper
- **Run button:** `bg-gray-900 text-white hover:bg-gray-700`, full-width below the code area
- **Next button:** `bg-green-600 text-white hover:bg-green-700`
- **Pass indicator:** `text-green-600` with ✓
- **Fail indicator:** `text-red-500` with ✗
- **Summary (pass):** `text-green-600`
- **Summary (fail):** `text-amber-600`

---

## What Not to Add

- Progress indicators, breadcrumbs, or step counters
- A "Previous" or back button
- Attempt history display
- AI hint UI (provider is wired but not surfaced)
- Any changes to `TeacherView`, `QuestionEditorCard`, `TestCasesEditor`, or engine files

---

## Out of Scope (V1)

Matches the teacher spec out-of-scope list:
- Real Python execution
- AI hint UI
- Multiple lessons
- Step deletion / reordering
- Persisted state
- Attempt history display
- Step progress indicators
