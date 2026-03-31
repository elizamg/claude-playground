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
    expect(result.aggregateFeedback).toContain('Test 1');
    expect(result.aggregateFeedback).toContain('Test 2');
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
