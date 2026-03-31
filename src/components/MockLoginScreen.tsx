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
