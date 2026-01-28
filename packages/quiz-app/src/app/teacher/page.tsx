"use client";
import { useState, useContext, useEffect, useCallback, useMemo } from "react";
import { ComputerContext } from "../common-components";
import { TeacherHelper } from "../helpers/TeacherHelper";
import { QuizHelper, Question } from "@quiz-app/contracts";
import Link from "next/link";

export default function TeacherPage() {
  const computer = useContext(ComputerContext);
  
  const [teacher, setTeacher] = useState<any | null>(null);
  const [teacherId, setTeacherId] = useState<string>('');
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  // UI state
  const [showRegister, setShowRegister] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);

  // Registration form state
  const [teacherName, setTeacherName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Quiz creation form state
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    rewardPerCorrect: 1000,
    duration: 300, // 5 minutes default
  });
  const [questions, setQuestions] = useState<any[]>([
    { text: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Initialize helpers only when computer is available
  const teacherHelper = useMemo(() => {
    return computer ? new TeacherHelper(computer) : null;
  }, [computer]);
  
  const quizHelper = useMemo(() => {
    return computer ? new QuizHelper(computer) : null;
  }, [computer]);

  // Debug computer context - must be before any conditional returns
  useEffect(() => {
    console.log("Teacher page - computer context:", computer);
    console.log("Teacher page - localStorage BIP_39_KEY:", typeof window !== "undefined" ? localStorage.getItem("BIP_39_KEY") : "undefined");
    console.log("Teacher page - teacherHelper:", !!teacherHelper);
    console.log("Teacher page - computer address:", computer ? computer.getAddress() : "N/A");
  }, [computer, teacherHelper]);

  const showMessage = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setModalContent({ title, message, type });
    setShowModal(true);
  };

  const loadTeacherData = useCallback(async () => {
    console.log("loadTeacherData - starting");
    try {
      setLoading(true);
      // Try to find existing teacher by public key
      if (!teacherHelper) {
        console.log("loadTeacherData - no teacherHelper available");
        return;
      }
      
      const publicKey = computer?.getPublicKey() || '';
      console.log("loadTeacherData - searching for teacher with public key:", publicKey);
      const existingTeacher = await teacherHelper.findTeacherByPublicKey(publicKey);
      
      if (existingTeacher) {
        console.log("loadTeacherData - found existing teacher:", existingTeacher.name);
        setTeacher(existingTeacher);
        setTeacherId(existingTeacher._id);
        setIsRegistered(true);
        
        if (teacherHelper) {
          console.log("loadTeacherData - loading teacher quizzes");
          const teacherQuizzes = await teacherHelper.getTeacherQuizzes(existingTeacher._id);
          console.log("loadTeacherData - teacher quizzes:", teacherQuizzes.length);
          setQuizzes(teacherQuizzes);
        }
      } else {
        console.log("loadTeacherData - no existing teacher found");
        setIsRegistered(false);
      }
    } catch (error) {
      console.error("Failed to load teacher data:", error);
    } finally {
      console.log("loadTeacherData - completed");
      setLoading(false);
    }
  }, [teacherHelper, computer]);

  useEffect(() => {
    console.log("Teacher page - useEffect triggered with computer:", !!computer);
    loadTeacherData();
  }, [computer, loadTeacherData]);

  const handleRegisterTeacher = async (name: string) => {
    if (!teacherHelper) return;
    
    try {
      setLoading(true);
      const newTeacherId = await teacherHelper.createTeacher(name);
      setTeacherId(newTeacherId);
      const newTeacher = await teacherHelper.getTeacher(newTeacherId);
      setTeacher(newTeacher);
      setShowRegister(false);
    } catch (error) {
      console.error("Failed to register teacher:", error);
      alert("Failed to register teacher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (quizData: {
    title: string;
    description: string;
    questions: Question[];
    rewardPerCorrect: bigint;
    duration?: number;
  }) => {
    if (!teacherHelper) return;
    
    try {
      setLoading(true);
      const { quizId, updatedTeacherId } = await teacherHelper.createQuiz({
        teacherId,
        ...quizData
      });
      
      setTeacherId(updatedTeacherId);
      const updatedTeacher = await teacherHelper.getTeacher(updatedTeacherId);
      setTeacher(updatedTeacher);
      
      const updatedQuizzes = await teacherHelper.getTeacherQuizzes(updatedTeacherId);
      setQuizzes(updatedQuizzes);
      setShowCreateQuiz(false);
      
      alert("Quiz created successfully!");
    } catch (error) {
      console.error("Failed to create quiz:", error);
      alert("Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkTeacherStatus = async () => {
    if (!computer || !teacherHelper) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const publicKey = computer.getPublicKey();
      
      // Check if teacher is already registered
      const existingTeacher = await teacherHelper.findTeacherByPublicKey(publicKey);
      
      if (existingTeacher) {
        setTeacher(existingTeacher);
        setIsRegistered(true);
        await loadTeacherQuizzes(existingTeacher.createdQuizzes);
      } else {
        setIsRegistered(false);
      }
    } catch (error) {
      console.error('Error checking teacher status:', error);
      setIsRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherQuizzes = async (quizIds: string[]) => {
    if (!quizHelper) return;
    
    try {
      const quizData = await Promise.all(
        quizIds.map(async (quizId) => {
          try {
            const [latestRev] = await computer?.query({ ids: [quizId] }) || [];
            if (latestRev) {
              return await computer?.sync(latestRev);
            }
            return null;
          } catch (error) {
            console.error(`Error loading quiz ${quizId}:`, error);
            return null;
          }
        })
      );
      
      const validQuizzes = quizData.filter(quiz => quiz !== null);
      setQuizzes(validQuizzes);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const registerAsTeacher = async () => {
    if (!computer || !teacherName.trim()) {
      showMessage('Error', 'Please enter your name', 'error');
      return;
    }

    try {
      setIsRegistering(true);
      const teacherId = await teacherHelper?.createTeacher(teacherName.trim());
      
      if (teacherId) {
        const teacher = await teacherHelper?.getTeacher(teacherId);
        setTeacher(teacher);
        setIsRegistered(true);
        showMessage('Success', 'Successfully registered as a teacher!');
        setTeacherName('');
      }
    } catch (error) {
      console.error('Error registering teacher:', error);
      showMessage('Error', `Failed to register: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const createQuiz = async () => {
    if (!computer || !teacher) return;

    // Validation
    if (!quizForm.title.trim() || !quizForm.description.trim()) {
      showMessage('Error', 'Please fill in title and description', 'error');
      return;
    }

    if (questions.some((q: any) => !q.text.trim() || q.options.some((opt: string) => !opt.trim()))) {
      showMessage('Error', 'Please complete all questions and options', 'error');
      return;
    }

    if (quizForm.rewardPerCorrect <= 0) {
      showMessage('Error', 'Reward must be greater than 0', 'error');
      return;
    }

    try {
      setIsCreatingQuiz(true);

      if (!teacherHelper) {
        showMessage('Error', 'Teacher helper not initialized', 'error');
        return;
      }

      const result = await teacherHelper.createQuiz({
        teacherId: teacher._id,
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        questions: questions,
        rewardPerCorrect: BigInt(quizForm.rewardPerCorrect),
        duration: quizForm.duration
      });

      // Reset form
      setQuizForm({
        title: '',
        description: '',
        rewardPerCorrect: 1000,
        duration: 300
      });
      setQuestions([{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
      setShowQuizForm(false);

      // Reload teacher data to get updated quiz list
      await loadTeacherData();
      
      showMessage('Success', 'Quiz created successfully!');
    } catch (error) {
      console.error('Error creating quiz:', error);
      showMessage('Error', `Failed to create quiz: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsCreatingQuiz(false);
    }
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
            Teacher Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please connect your wallet to access the teacher portal.
          </p>
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Go to the home page to connect your wallet, then return here to start teaching.
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
              Teacher Registration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Register as a teacher to start creating quizzes
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="teacherName"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
              />
            </div>

            <button
              onClick={registerAsTeacher}
              disabled={isRegistering || !teacherName.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? 'Registering...' : 'Register as Teacher'}
            </button>
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
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome, {teacher?.name}! Manage your quizzes and track student progress.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quizzes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{quizzes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Quizzes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {quizzes.filter(q => q.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Attempts</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {quizzes.reduce((sum, quiz) => sum + (quiz.attemptedStudents?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowQuizForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create New Quiz
          </button>
          
          <Link
            href="/wallet"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            Manage Wallet
          </Link>
        </div>

        {/* Quizzes List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Quizzes</h2>
          </div>
          
          {quizzes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p>No quizzes created yet</p>
              <p className="text-sm mt-1">Click Create New Quiz to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {quiz.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          quiz.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {quiz.questions?.length || 0} questions
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {quiz.attemptedStudents?.length || 0} attempts
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {quiz.rewardPerCorrect} satoshis per correct answer
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/quizzes/${quiz._id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quiz Creation Modal */}
      {showQuizForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Quiz</h2>
                <button
                  onClick={() => setShowQuizForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Quiz Form */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quiz Title
                    </label>
                    <input
                      type="text"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter quiz title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reward per Correct Answer (satoshis)
                    </label>
                    <input
                      type="number"
                      value={quizForm.rewardPerCorrect}
                      onChange={(e) => setQuizForm({ ...quizForm, rewardPerCorrect: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Enter quiz description"
                  />
                </div>

                {/* Questions */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Questions</h3>
                    <button
                      onClick={addQuestion}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Add Question
                    </button>
                  </div>

                  {questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 mb-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">
                          Question {questionIndex + 1}
                        </h4>
                        {questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(questionIndex)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Question Text
                        </label>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter question text"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options.map((option: string, optionIndex: number) => (
                          <div key={optionIndex} className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                              className="mr-2"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowQuizForm(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createQuiz}
                    disabled={isCreatingQuiz}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingQuiz ? 'Creating...' : 'Create Quiz'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for messages */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className={`text-lg font-semibold mb-2 ${
              modalContent.type === 'error' ? 'text-red-600' : 'text-green-600'
            }`}>
              {modalContent.title}
            </h3>
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