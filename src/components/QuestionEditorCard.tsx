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
