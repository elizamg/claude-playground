import { useState } from 'react';
import type { Lesson, User } from './engine/types';
import { MOCK_LESSON, MOCK_USERS } from './data/mockData';
import MockLoginScreen from './components/MockLoginScreen';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lesson, setLesson] = useState<Lesson>(deepClone(MOCK_LESSON));

  const handleLogin = (user: User) => {
    if (user.role === 'teacher') {
      setLesson(deepClone(MOCK_LESSON));
    }
    setCurrentUser(user);
  };

  if (!currentUser) {
    return <MockLoginScreen onLogin={handleLogin} />;
  }

  if (currentUser.role === 'teacher') {
    return <TeacherView lesson={lesson} onLessonChange={setLesson} />;
  }

  return <StudentView />;
}
