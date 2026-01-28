"use client";
import { useState, useContext, useEffect, useCallback, useMemo } from "react";
import { ComputerContext } from "../common-components";
import { StudentHelper } from "../helpers/StudentHelper";
import { QuizHelper } from "@quiz-app/contracts";
import { QuizAttemptHelper } from "../helpers/QuizAttemptHelper";
//import { QuizPaymentHelper } from "../helpers/QuizPaymentHelper";
import Link from "next/link";

interface Student {
  _id: string;
  name: string;
  publicKey: string;
  completedQuizzes: string[];
  totalEarnings: bigint;
  registeredAt: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  isActive: boolean;
  rewardPerCorrect: bigint;
  questions: any[];
  createdAt: number;
  teacherPublicKey: string;
}

export default function StudentPage() {
  const computer = useContext(ComputerContext);
  const [student, setStudent] = useState<Student | null>(null);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<Quiz[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  // Registration form state
  const [studentName, setStudentName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Initialize helpers only when computer is available
  const studentHelper = useMemo(() => {
    return computer ? new StudentHelper(computer) : null;
  }, [computer]);
  
  const quizHelper = useMemo(() => {
    return computer ? new QuizHelper(computer) : null;
  }, [computer]);
  
  const attemptHelper = useMemo(() => {
    return computer ? new QuizAttemptHelper(computer) : null;
  }, [computer]);
  
  const paymentHelper = useMemo(() => {
   // return computer ? new QuizPaymentHelper(computer) : null;
   return null; // Placeholder as paymentHelper is not used currently
  }, [computer]);

  // Debug computer context - must be before any conditional returns
  useEffect(() => {
    console.log("Student page - computer context:", computer);
    console.log("Student page - localStorage BIP_39_KEY:", typeof window !== "undefined" ? localStorage.getItem("BIP_39_KEY") : "undefined");
    console.log("Student page - studentHelper:", !!studentHelper);
    console.log("Student page - computer address:", computer ? computer.getAddress() : "N/A");
  }, [computer, studentHelper]);

  const showMessage = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setModalContent({ title, message, type });
    setShowModal(true);
  };

  const loadStudentData = useCallback(async (studentData: Student) => {
    console.log("loadStudentData - starting for student:", studentData._id);
    if (!studentHelper) {
      console.log("loadStudentData - no studentHelper available");
      return;
    }
    
    try {
      // Load completed quizzes
      console.log("loadStudentData - fetching completed quizzes");
      const completedQuizData = await studentHelper.getCompletedQuizzes(studentData._id);
      console.log("loadStudentData - completed quizzes:", completedQuizData);
      setCompletedQuizzes(completedQuizData);
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  }, [studentHelper]);

  const loadAvailableQuizzes = useCallback(async () => {
    console.log("loadAvailableQuizzes - starting");
    if (!quizHelper || !computer) {
      console.log("loadAvailableQuizzes - missing dependencies:", {quizHelper: !!quizHelper, computer: !!computer});
      return;
    }
    
    try {
      console.log("loadAvailableQuizzes - querying blockchain");
      // Get all active quizzes by querying the blockchain
      const revs = await computer.query({});
      console.log("loadAvailableQuizzes - got revisions:", revs.length);
      const allQuizzes: Quiz[] = [];
      
      for (const rev of revs) {
        try {
          const obj = await computer.sync(rev);
          // Check if this is a Quiz object that's active
          if (obj && typeof obj === 'object' && 'title' in obj && 'isActive' in obj && (obj as any).isActive) {
            console.log("loadAvailableQuizzes - found active quiz:", (obj as any).title);
            allQuizzes.push(obj as Quiz);
          }
        } catch (error) {
          // Skip objects that can't be synced or aren't quizzes
          continue;
        }
      }
      
      // Filter out quizzes the student has already completed
      const availableForStudent = student 
        ? allQuizzes.filter(quiz => !student.completedQuizzes.includes(quiz._id))
        : allQuizzes;
      
      console.log("loadAvailableQuizzes - setting available quizzes:", availableForStudent.length);
      setAvailableQuizzes(availableForStudent);
    } catch (error) {
      console.error('Error loading available quizzes:', error);
    }
  }, [quizHelper, computer, student]);

  const checkStudentStatus = useCallback(async () => {
    console.log("checkStudentStatus - starting");
    if (!computer || !studentHelper) {
      console.log("checkStudentStatus - missing dependencies:", {computer: !!computer, studentHelper: !!studentHelper});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const publicKey = computer.getPublicKey();
      console.log("checkStudentStatus - public key:", publicKey);
      
      // Check if student is already registered using localStorage
      const studentId = localStorage.getItem(`student_${publicKey}`);
      console.log("checkStudentStatus - stored student ID:", studentId);
      
      if (studentId) {
        try {
          console.log("checkStudentStatus - fetching existing student");
          const existingStudent = await studentHelper.getStudent(studentId);
          if (existingStudent) {
            console.log("checkStudentStatus - found existing student:", existingStudent.name);
            setStudent(existingStudent);
            setIsRegistered(true);
            await loadStudentData(existingStudent);
          } else {
            console.log("checkStudentStatus - student not found, removing from localStorage");
            localStorage.removeItem(`student_${publicKey}`);
            setIsRegistered(false);
          }
        } catch (error) {
          // Student ID exists but can't fetch - may be invalid
          console.error('Error fetching stored student:', error);
          localStorage.removeItem(`student_${publicKey}`);
          setIsRegistered(false);
        }
      } else {
        console.log("checkStudentStatus - no stored student, not registered");
        setIsRegistered(false);
      }
      
      // Load available quizzes regardless of registration status
      console.log("checkStudentStatus - loading available quizzes");
      await loadAvailableQuizzes();
    } catch (error) {
      console.error('Error checking student status:', error);
      setIsRegistered(false);
    } finally {
      console.log("checkStudentStatus - completed");
      setLoading(false);
    }
  }, [computer, studentHelper, loadStudentData, loadAvailableQuizzes]);

  useEffect(() => {
    console.log("Student page - useEffect triggered with computer:", !!computer);
    checkStudentStatus();
  }, [computer, checkStudentStatus]);

  const registerAsStudent = async () => {
    if (!computer || !studentHelper || !studentName.trim()) {
      showMessage('Error', 'Please enter your name', 'error');
      return;
    }

    try {
      setIsRegistering(true);
      const studentId = await studentHelper.createStudent(studentName.trim());
      
      // Store student ID for this public key
      const publicKey = computer.getPublicKey();
      localStorage.setItem(`student_${publicKey}`, studentId);
      
      // Fetch the complete student object
      const newStudent = await studentHelper.getStudent(studentId);
      setStudent(newStudent);
      setIsRegistered(true);
      showMessage('Success', 'Successfully registered as a student!');
      setStudentName('');
      
      // Reload available quizzes after registration
      await loadAvailableQuizzes();
    } catch (error) {
      console.error('Error registering student:', error);
      showMessage('Error', `Failed to register: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const hasAttemptedQuiz = async (quizId: string): Promise<boolean> => {
    if (!student || !attemptHelper) return false;
    
    try {
      const attempts = await attemptHelper.getStudentAttempts(student.publicKey);
      return attempts.some(attempt => attempt.quizId === quizId);
    } catch (error) {
      console.error('Error checking quiz attempt:', error);
      return false;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatEarnings = (satoshis: bigint | number) => {
    return Number(satoshis).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!computer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Student Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please connect your wallet to access the student portal.
          </p>
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Go to the home page to connect your wallet, then return here to start learning.
              </p>
              <Link 
                href="/" 
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Go to Home Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Student Registration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Register as a student to start taking quizzes and earning rewards
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
              />
            </div>

            <button
              onClick={registerAsStudent}
              disabled={isRegistering || !studentName.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? 'Registering...' : 'Register as Student'}
            </button>

            {/* Preview available quizzes */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Available Quizzes ({availableQuizzes.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Register to access these quizzes and start earning Bitcoin rewards!
              </p>
              {availableQuizzes.slice(0, 3).map((quiz) => (
                <div key={quiz._id} className="mb-2 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="font-medium text-gray-900 dark:text-white">{quiz.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reward: {Number(quiz.rewardPerCorrect)} satoshis per correct answer
                  </p>
                </div>
              ))}
              {availableQuizzes.length > 3 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ...and {availableQuizzes.length - 3} more quizzes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Student Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome, {student?.name}! Take quizzes and earn Bitcoin rewards.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatEarnings(student?.totalEarnings || 0n)} sats
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Quizzes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {completedQuizzes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Quizzes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {availableQuizzes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {completedQuizzes.length > 0 ? '85%' : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/quizzes"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"></path>
            </svg>
            Browse All Quizzes
          </Link>
          
          <Link
            href="/wallet"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            View Wallet
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Quizzes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Quizzes</h2>
            </div>
            
            {availableQuizzes.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p>No quizzes available</p>
                <p className="text-sm mt-1">Check back later for new quizzes</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {availableQuizzes.map((quiz) => (
                  <div key={quiz._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {quiz.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {quiz.description}
                        </p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{quiz.questions?.length || 0} questions</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {Number(quiz.rewardPerCorrect)} sats/correct
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/quizzes/${quiz._id}`}
                        className="ml-4 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Take Quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {availableQuizzes.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/quizzes"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View all available quizzes →
                </Link>
              </div>
            )}
          </div>

          {/* Completed Quizzes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Completions</h2>
            </div>
            
            {completedQuizzes.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>No completed quizzes yet</p>
                <p className="text-sm mt-1">Start taking quizzes to earn rewards!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {completedQuizzes.map((quiz) => (
                  <div key={quiz._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {quiz.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Completed on {formatDate(quiz.createdAt)}
                        </p>
                        <div className="flex items-center mt-2 space-x-4 text-sm">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            Earned: {Number(quiz.rewardPerCorrect) * quiz.questions.length} sats
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          
          <div className="p-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>No recent activity</p>
              <p className="text-sm mt-1">Your quiz activity will appear here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Modal for messages */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{modalContent.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{modalContent.message}</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}