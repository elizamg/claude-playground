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
