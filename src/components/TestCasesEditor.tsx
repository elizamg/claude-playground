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
      id: crypto.randomUUID(),
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
