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
      id: crypto.randomUUID(),
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
