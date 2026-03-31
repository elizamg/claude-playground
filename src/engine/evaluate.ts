import type { MockExecutionResult, ReturnTypeName, Step, StepResult, TestCaseResult } from './types';

export function mockExecute(_code: string, _input: string): MockExecutionResult {
  return {
    returnValue: 5,
    returnType: 'int' as ReturnTypeName,
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
